// Cloudflare Pages Functions 中间件
export const onRequest = async (context) => {
    return context.next()
}

