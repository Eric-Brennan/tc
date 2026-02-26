import { useState, useCallback } from "react";
import { TherapistBookmark, mockTherapistBookmarks } from "../data/mockData";
import { persistMockData } from "../data/devPersistence";
import { useLinkPreview, fetchLinkPreview } from "../hooks/useLinkPreview";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Bookmark,
  Plus,
  Search,
  X,
  Globe,
  ExternalLink,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

/** Extract domain from a URL for display */
function getDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Get a colour based on the domain (deterministic) */
function getDomainColor(url: string): string {
  const domain = getDomain(url);
  const colors = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-violet-500 to-violet-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
    "from-cyan-500 to-cyan-600",
    "from-fuchsia-500 to-fuchsia-600",
    "from-teal-500 to-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ── Bookmark row with auto-fetched preview image ───────────────────
function BookmarkRow({
  bk,
  isEditing,
  onEdit,
  onDelete,
}: {
  bk: TherapistBookmark;
  isEditing: boolean;
  onEdit: (bk: TherapistBookmark) => void;
  onDelete: (bk: TherapistBookmark) => void;
}) {
  const { preview, loading } = useLinkPreview(bk.url);
  const image = preview?.image;

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
        isEditing ? "ring-2 ring-primary bg-muted/30" : ""
      }`}
    >
      {/* Preview image or fallback gradient */}
      {loading ? (
        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        </div>
      ) : image ? (
        <img
          src={image}
          alt=""
          className="w-10 h-10 rounded-md object-cover shrink-0 bg-muted"
          onError={(e) => {
            const target = e.currentTarget;
            const fallback = target.nextElementSibling as HTMLElement | null;
            target.style.display = "none";
            if (fallback) fallback.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`w-10 h-10 rounded-md bg-gradient-to-br ${getDomainColor(
          bk.url
        )} items-center justify-center shrink-0`}
        style={{ display: loading || image ? "none" : "flex" }}
      >
        <Globe className="w-4.5 h-4.5 text-white/90" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{bk.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
          <a
            href={bk.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary truncate transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {getDomain(bk.url)}
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(bk)}
          title="Edit bookmark"
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete(bk)}
          title="Delete bookmark"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Main dialog ────────────────────────────────────────────────────
interface BookmarkManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapistId: string;
}

export default function BookmarkManagerDialog({
  open,
  onOpenChange,
  therapistId,
}: BookmarkManagerDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<TherapistBookmark | null>(null);
  const [tick, setTick] = useState(0);

  // Read bookmarks from global source of truth
  const bookmarks = mockTherapistBookmarks.filter(
    (b) => b.therapistId === therapistId && tick >= 0
  );

  const filtered = bookmarks.filter((bk) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return bk.title.toLowerCase().includes(q) || bk.url.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setFormTitle("");
    setFormUrl("");
    setFetchingTitle(false);
    setShowAddForm(false);
    setEditingId(null);
  };

  // Auto-fetch title when URL is pasted / blurred
  const handleUrlBlur = useCallback(async () => {
    let url = formUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

    // Only auto-fill if title is empty
    if (formTitle.trim()) return;

    setFetchingTitle(true);
    try {
      const meta = await fetchLinkPreview(url);
      if (meta.title) {
        setFormTitle(meta.title);
      }
    } catch {
      // silently fail
    } finally {
      setFetchingTitle(false);
    }
  }, [formUrl, formTitle]);

  const handleSave = () => {
    if (!formUrl.trim()) {
      toast.error("Please provide a URL");
      return;
    }
    let url = formUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

    // Use form title, or fall back to the domain
    const title = formTitle.trim() || getDomain(url);

    if (editingId) {
      const bk = mockTherapistBookmarks.find((b) => b.id === editingId);
      if (bk) {
        bk.title = title;
        bk.url = url;
        persistMockData();
        setTick((t) => t + 1);
        toast.success("Bookmark updated");
      }
    } else {
      mockTherapistBookmarks.push({
        id: `bk-${Date.now()}`,
        therapistId,
        title,
        url,
        createdAt: new Date(),
      });
      persistMockData();
      setTick((t) => t + 1);
      toast.success("Bookmark added");
    }
    resetForm();
  };

  const handleEdit = (bk: TherapistBookmark) => {
    setFormTitle(bk.title);
    setFormUrl(bk.url);
    setEditingId(bk.id);
    setShowAddForm(true);
  };

  const handleDelete = () => {
    if (!bookmarkToDelete) return;
    const idx = mockTherapistBookmarks.findIndex((b) => b.id === bookmarkToDelete.id);
    if (idx !== -1) {
      mockTherapistBookmarks.splice(idx, 1);
      persistMockData();
      setTick((t) => t + 1);
      toast("Bookmark deleted");
    }
    setBookmarkToDelete(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) resetForm();
          onOpenChange(v);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col" aria-describedby="bookmark-manager-desc">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Manage Bookmarks
            </DialogTitle>
            <DialogDescription id="bookmark-manager-desc">
              Save links to share with clients. Preview images and titles are fetched automatically.
            </DialogDescription>
          </DialogHeader>

          {/* Search + Add */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            {!showAddForm && (
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                size="sm"
                className="gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            )}
          </div>

          {/* Add / Edit Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <p className="text-sm font-medium">
                {editingId ? "Edit Bookmark" : "New Bookmark"}
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="bk-url" className="text-xs">
                  URL
                </Label>
                <Input
                  id="bk-url"
                  placeholder="https://example.com/article"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  onBlur={handleUrlBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                />
                <p className="text-[10px] text-muted-foreground">
                  Paste a link — the title and preview image will be fetched automatically
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-title" className="text-xs flex items-center gap-1.5">
                  Title
                  <span className="text-muted-foreground">(optional override)</span>
                  {fetchingTitle && (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  )}
                </Label>
                <Input
                  id="bk-title"
                  placeholder={fetchingTitle ? "Fetching title..." : "Auto-detected from link"}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} size="sm" className="gap-1.5" disabled={!formUrl.trim()}>
                  {editingId ? (
                    <>
                      <Edit className="w-3.5 h-3.5" />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Save
                    </>
                  )}
                </Button>
                <Button onClick={resetForm} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Bookmark List */}
          <div className="flex-1 overflow-y-auto -mx-6 px-6 min-h-0">
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <Bookmark className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No bookmarks match your search"
                    : "No bookmarks saved yet. Add one above to get started."}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((bk) => (
                  <BookmarkRow
                    key={bk.id}
                    bk={bk}
                    isEditing={editingId === bk.id}
                    onEdit={handleEdit}
                    onDelete={setBookmarkToDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer count */}
          {bookmarks.length > 0 && (
            <div className="text-xs text-muted-foreground text-center pt-1 border-t">
              {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""} saved
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!bookmarkToDelete}
        onOpenChange={(v) => {
          if (!v) setBookmarkToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bookmark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{bookmarkToDelete?.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
