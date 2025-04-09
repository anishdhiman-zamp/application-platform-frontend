export type UploadFileResponseType = {
  identifier: string;
  url: string;
  fileName: string;
  downloadableUrl: string;
  rawFile: File | null;
};

export type SignedUrlResponseType = {
  file_name: string;
  file_type: string;
  file_upload_id: string;
  key: string;
  upload_url: string;
};

export type SignedUrlBodyType = {
  file_name: string;
  file_type: string;
};
