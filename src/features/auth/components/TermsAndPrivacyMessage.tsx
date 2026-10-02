import { Link } from "react-router-dom";

interface TermsAndPrivacyMessageProps{
    message:string;
}

export default function TermsAndPrivacyMessage({message}:TermsAndPrivacyMessageProps) {
  return (
    <div className="flex flex-col w-full items-center justify-center text-muted-foreground md:text-xs text-center text-[10px]">
     <p className="p-2"> By {message}, you agree to out <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
      Standard enterprise encryption enabled.</p>
    </div>
  )
}
