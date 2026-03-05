import Link from "next/link"

export const metadata = {
  title: "About the Author — The American Piedmont",
  description:
    "Rick Newkirk — founder of The American Piedmont, focused on narrative, reporting, and civic memory.",
}

export default function AboutTheAuthorPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid gap-12 md:grid-cols-12">
        


        {/* LEFT COLUMN */}
<aside className="md:col-span-4">
  <div className="overflow-hidden rounded-lg border border-black/10">
    <img
      src="images/about/rick-headshot.png"
      alt="Rick Newkirk"
      className="w-full object-cover"
    />
  </div>

<p className="mt-6 font-serif text-base italic leading-snug opacity-80">
Reporting on civic memory.</p>

  <div className="mt-6 text-sm space-y-2 opacity-80">
    <p>
      <a
        href="mailto:rick@theamericanpiedmont.com"
        className="underline underline-offset-4"
      >
        rick@theamericanpiedmont.com
      </a>
    </p>

    <p>
      <a
        href="https://www.linkedin.com/in/ricknewkirk/"
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4"
      >
        LinkedIn
      </a>
    </p>

    <p>Based in the American Piedmont</p>



  </div>

  
</aside>

        {/* RIGHT COLUMN */}
        <section className="md:col-span-8">
          
          <p className="text-xs uppercase tracking-[0.2em] opacity-50">
            About the Author
          </p>

          <h1 className="mt-3 font-serif text-4xl leading-tight">
            Rick Newkirk
          </h1>

          <div className="mt-8 max-w-2xl space-y-6 text-[17px] leading-[1.75]">
            <p>
              Rick Newkirk is the founder of <em>The American Piedmont</em>, 
              a narrative newsroom examining power, history, and civic memory in the American South.
            </p>

            <p>
              His work combines longform reporting, primary-source research,
              and digital publishing architecture. TAP is designed to both tell 
              stories and to preserve evidence.
            </p>

            <p>
              Over the course of his career, Rick has produced award-winning media,
              earning recognition for innovative digital storytelling and creative popular fiction.
            </p>

            <p>
              His writing has appeared in <em>USA Today</em>, <em>TechCrunch</em>, <em>The Courier-Journal</em>, and <em>Washington Jewish Week</em>.
            </p>

            <p>
              Em dashes do not indicate robot prose.
            </p>

          </div>
{/* Subtle Award Logos */}
  <div className="mt-10">
    
    <div className="mt-8 flex flex-wrap items-center gap-x-12 gap-y-4 opacity-90">
        
        <img
  src="/images/logos/la-screenplay.png"
  alt="LA Screenplay Awards"
  className="h-14 w-auto opacity-80"
  loading="lazy"
/>

<img
  src="/images/logos/Shorty.svg"
  alt="Shorty Awards"
  className="h-14 w-auto opacity-80"
  loading="lazy"
/>

<img
  src="/images/logos/save_the_cat.png"
  alt="Save the Cat"
  className="h-14 w-auto opacity-80"
  loading="lazy"
/>

<img
  src="/images/logos/webby.png"
  alt="Webby Awards"
  className="h-14 w-auto opacity-80"
  loading="lazy"
/>

<img
  src="/images/logos/riff.png"
  alt="Richmond International Film Festival"
  className="h-14 w-auto opacity-80"
  loading="lazy"
/>

</div>

    
  </div>
          
        </section>
      </div>
    </main>
  )
}