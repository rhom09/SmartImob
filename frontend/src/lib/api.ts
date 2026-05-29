export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Garante que o path comece com /api se não estiver incluído
  const finalPath = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;
  return `${API_URL}${finalPath}`;
};
