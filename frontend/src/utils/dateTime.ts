export const localDateTimeInput = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export const toIsoInstant = (date: string) => new Date(date).toISOString();
export const displayDateTime = (date: string) => new Date(date).toLocaleString();
