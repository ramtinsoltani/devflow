import { Document, Types } from "mongoose";

export function normalizeCommonDocument(doc: Document<any>) {

  const normalized: any = {
    id: (doc._id as Types.ObjectId).toString(),
    ...doc.toJSON(),
    updatedAt: (doc as any).updatedAt.getTime(),
    createdAt: (doc as any).createdAt.getTime()
  };

  delete normalized.__v;
  delete normalized._id;

  return normalized;

}