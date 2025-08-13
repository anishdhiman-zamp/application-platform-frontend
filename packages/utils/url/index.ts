export const formRequestUrlWithParams = (url: string, params: Record<string, string>) => {
  let formattedUrl = url;

  Object.keys(params).forEach((key) => {
    formattedUrl = formattedUrl?.replace(`{{${key}}}`, params[key]);
  });

  return formattedUrl;
};
