export const deployment = process.env.NEXT_PUBLIC_DEPLOYMENT ?? 'mvp';
export const isMVP = deployment === 'mvp';
export const isPostMVP = deployment === 'post-mvp';
