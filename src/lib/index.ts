import { Incident } from "incident";

throw new Incident(
  "IndexImport",
  // tslint:disable-next-line:max-line-length
  "You cannot import `kryo`'s index module, use deep imports such as `import { DocumentType } from \"kryo/types/document\"`.",
);
