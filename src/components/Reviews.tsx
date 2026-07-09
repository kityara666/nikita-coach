import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const reviews = [
  { name: "Andrey", rank: "Archon → Ancient", rating: 5, text: "Climbed two ranks in a month." },
  { name: "Misha", rank: "Divine", rating: 5, text: "His draft advice changed how I play." },
  { name: "Roma", rank: "Crusader → Archon", rating: 4, text: "Patient and super clear." },
];

export function Reviews() {
  return (
    <section className="py-24 px-4 max-w-6xl mx-auto" id="reviews">
      <h2 className="text-3xl font-bold mb-12 text-center text-zinc-50">Rewiews</h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        
    {reviews.map((reviewer) => (
    <Card key={reviewer.name} className='bg-zinc-900 text-zinc-50 border border-zinc-800 flex flex-col justify-between'>
        <CardHeader>
            <CardTitle className="text-2xl">{reviewer.name}</CardTitle>
            <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">{reviewer.rank}</h2>
            <p className="text-3xl text-yellow-500">{"★".repeat(reviewer.rating)}{"☆".repeat(5 - reviewer.rating)}</p>
        </CardHeader>
        
        <CardContent>
            <p className="text-zinc-300 italic leading-relaxed">{reviewer.text}</p>
        </CardContent>
    </Card>
    ))}
        
      </div>
    </section>
  );
}