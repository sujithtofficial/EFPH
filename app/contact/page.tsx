import ContactForm from "@/components/ContactForm";
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const initialType = type && ["general", "prayer", "visit", "counselling", "other"].includes(type) ? type : "general";
  return <ContactForm key={initialType} initialType={initialType} />;
}
