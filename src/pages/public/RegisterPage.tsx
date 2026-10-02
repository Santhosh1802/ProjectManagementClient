import ProductWording from "@/features/auth/components/ProductWording"
import RegistrationForm from "@/features/auth/components/RegistrationForm"
import TermsAndPrivacyMessage from "@/features/auth/components/TermsAndPrivacyMessage"

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-muted">
      <div className="flex min-h-screen">
        <section className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-10">
          <ProductWording />
        </section>
        <section className="flex w-full items-center justify-center p-6 lg:w-1/2">
          <div className="flex w-full max-w-sm flex-col items-center gap-3">
            <RegistrationForm />
            <TermsAndPrivacyMessage message="creating an account" />
          </div>
        </section>
      </div>
    </main>
  )
}
