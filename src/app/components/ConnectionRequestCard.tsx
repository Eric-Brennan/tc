import { ConnectionRequest, Client } from "../data/mockData";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Check, X, Mail } from "lucide-react";
import { Badge } from "./ui/badge";

interface ConnectionRequestCardProps {
  request: ConnectionRequest;
  client: Client;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onMessage: (clientId: string) => void;
}

export default function ConnectionRequestCard({
  request,
  client,
  onAccept,
  onReject,
  onMessage
}: ConnectionRequestCardProps) {
  const isPending = request.status === 'pending';
  const isAccepted = request.status === 'accepted';

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-3 items-start">
          <img
            src={client.avatar}
            alt={client.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{client.name}</h4>
              {isAccepted && (
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
              )}
              {isPending && (
                <Badge variant="secondary">Pending</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{client.email}</p>
            {client.location && (
              <p className="text-sm text-muted-foreground">{client.location}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {client.areasOfFocus && client.areasOfFocus.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Areas of Concern:</p>
            <div className="flex flex-wrap gap-1">
              {client.areasOfFocus.map((area) => (
                <Badge key={area} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {request.message && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm italic">"{request.message}"</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {isPending && (
          <>
            <Button
              onClick={() => onAccept(request.id)}
              className="flex-1 gap-2"
            >
              <Check className="w-4 h-4" />
              Accept
            </Button>
            <Button
              onClick={() => onReject(request.id)}
              variant="outline"
              className="flex-1 gap-2"
            >
              <X className="w-4 h-4" />
              Decline
            </Button>
          </>
        )}
        {isAccepted && (
          <Button
            onClick={() => onMessage(client.id)}
            className="w-full gap-2"
          >
            <Mail className="w-4 h-4" />
            Send Message
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}