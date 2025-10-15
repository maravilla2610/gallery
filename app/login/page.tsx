import LoginFormDemo from '@/components/login-form-demo'
import Link from 'next/link'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple'
export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      <BackgroundRippleEffect />
      <div className="relative z-10 flex flex-col items-center gap-4 p-8">
        <LoginFormDemo />
      </div>
    </div>
  )
}
