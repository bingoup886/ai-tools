import CryptoJS from 'crypto-js'

const PASSWORD_HASH = 'dde6ecd6406700aa000b213c843a3091'

export const usePassword = () => {
  const verifyPassword = (password) => {
    const hash = CryptoJS.MD5(password).toString()
    return hash === PASSWORD_HASH
  }

  return {
    verifyPassword
  }
}

