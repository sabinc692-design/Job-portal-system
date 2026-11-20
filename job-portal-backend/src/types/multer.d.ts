declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        stream: any;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
    interface Request {
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}

declare module "multer" {
  import type { Request, Response, NextFunction } from "express";

  namespace multer {
    type File = Express.Multer.File;

    interface StorageEngine {
      _handleFile(req: Request, file: File, callback: (error?: any, info?: any) => void): void;
      _removeFile(req: Request, file: File, callback: (error: Error | null) => void): void;
    }

    interface Options {
      dest?: string;
      storage?: StorageEngine;
      limits?: {
        fieldNameSize?: number;
        fieldSize?: number;
        fields?: number;
        fileSize?: number;
        files?: number;
        parts?: number;
        headerPairs?: number;
      };
      preservePath?: boolean;
      fileFilter?: (
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile?: boolean) => void
      ) => void;
    }

    class MulterError extends Error {
      name: string;
      code: string;
      message: string;
      field?: string;
    }

    function memoryStorage(): StorageEngine;
    function diskStorage(options?: any): StorageEngine;
  }

  interface Instance {
    single(fieldName: string): (req: Request, res: Response, next: NextFunction) => void;
    array(fieldName: string, maxCount?: number): (req: Request, res: Response, next: NextFunction) => void;
    fields(fields: Array<{ name: string; maxCount?: number }>): (req: Request, res: Response, next: NextFunction) => void;
    none(): (req: Request, res: Response, next: NextFunction) => void;
    any(): (req: Request, res: Response, next: NextFunction) => void;
  }

  function multer(options?: multer.Options): Instance;

  export = multer;
}
