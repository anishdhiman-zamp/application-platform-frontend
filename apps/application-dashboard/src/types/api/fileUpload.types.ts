export type UploadFileResponseType = {
  identifier: string;
  url: string;
  fileName: string;
  downloadableUrl: string;
  rawFile: File | null;
};

export type SignedUrlBodyType = {
  file_name: string;
  file_type: string;
};
