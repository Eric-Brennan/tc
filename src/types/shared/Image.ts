import type { ImageType } from "./enums/ImageType";

export interface Image {
  id: string;
  imageType: ImageType;
  url: string;
  altText?: string;
}
