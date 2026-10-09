import ProductWording from "@/features/auth/components/ProductWording";
import RegistrationForm from "@/features/auth/components/RegistrationForm";
import TermsAndPrivacyMessage from "@/features/auth/components/TermsAndPrivacyMessage";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-6 py-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Product introduction */}
          <section className="hidden lg:block">
            <ProductWording />
          </section>

          {/* Registration */}
          <section className="flex justify-center">
            <div className="w-full max-w-sm">
              <RegistrationForm />

              <TermsAndPrivacyMessage message="creating an account" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}