export const fbCodeListeners: any = [];

(window as any).setFbCode = function(code: string) {
  fbCodeListeners.forEach((l: any) => l(code))
}


export const vkCodeListeners: any = [];

(window as any).setVkCode = function(code: string) {
  vkCodeListeners.forEach((l: any) => l(code))
}

export const googleCodeListeners: any = [];

(window as any).setGoogleCode = function(code: string) {
  googleCodeListeners.forEach((l: any) => l(code))
}