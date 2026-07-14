import type { RegisterSWOptions } from 'vite-plugin-pwa/types'

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>

let options: RegisterSWOptions | undefined
let updateServiceWorker: UpdateServiceWorker = async () => {}

export function configurePwaRegisterStub({
  update = async () => {},
}: {
  update?: UpdateServiceWorker
} = {}) {
  updateServiceWorker = update
}

export function getPwaRegisterOptions() {
  return options
}

export function registerSW(registerOptions: RegisterSWOptions = {}) {
  options = registerOptions
  return (reloadPage?: boolean) => updateServiceWorker(reloadPage)
}
