export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  readTime: string;
  image: string;
  date: string;
}

const u = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&h=450&fit=crop&auto=format&q=80`;

export const BLOG_CATEGORIES = [
  'all',
  'guides',
  'culture',
  'releases',
  'care',
  'history',
] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-spot-fake-jordans',
    title: 'How to Spot Fake Jordans: A Complete Authentication Guide',
    excerpt:
      'Protect your investment with our detailed breakdown of what to look for when authenticating Air Jordans, from stitching patterns to box labels.',
    category: 'guides',
    tags: ['authentication', 'jordan', 'buying tips'],
    readTime: '7 min read',
    image: u('photo-1597045566677-8cf032ed6634'),
    date: '2026-03-15',
    content: `
      <h2>Why Authentication Matters</h2>
      <p>The counterfeit sneaker market has exploded in recent years, with replicas becoming increasingly difficult to distinguish from the real thing. Whether you are buying from a marketplace, a <a href="/glossary/reseller" class="text-bcs-rust hover:text-bcs-rust2 underline">reseller</a>, or even a friend, knowing how to spot fakes can save you hundreds of dollars and a lot of frustration. At Bridge City Soles, every pair we sell goes through a rigorous multi-point authentication process, but we believe every <a href="/glossary/sneakerhead" class="text-bcs-rust hover:text-bcs-rust2 underline">sneakerhead</a> should know these basics.</p>

      <h2>Check the Stitching and Build Quality</h2>
      <p>Authentic Jordans feature tight, consistent stitching with no loose threads or uneven spacing. Pay close attention to the stitching around the Swoosh, the heel tab, and the collar. Fakes often have sloppy thread work, crooked seams, or stitching that varies in density from one panel to the next. Run your finger along the seams; legitimate pairs have a uniform feel with no bumps or gaps.</p>
      <ul>
        <li>Swoosh placement should be symmetrical on both shoes</li>
        <li>Heel stitching should form clean, even rows</li>
        <li>No glue stains or excess adhesive around the sole</li>
        <li>Tongue tag text should be crisp and properly aligned</li>
      </ul>

      <h2>Inspect the Box and Labels</h2>
      <p>The shoebox itself tells a story. Authentic <a href="/glossary/nike" class="text-bcs-rust hover:text-bcs-rust2 underline">Nike</a> boxes use a specific cardboard weight and finish that feels sturdy but not overly thick. Check the label on the end of the box: the font should be clean, the sizing info accurate, and the barcode should scan to the correct product. Style codes are another giveaway. Cross-reference the style code on the box with the tag inside the shoe and with Nike's official database. If any of them mismatch, walk away. A thorough <a href="/glossary/legit-check-lc" class="text-bcs-rust hover:text-bcs-rust2 underline">legit check</a> always includes verifying these details.</p>

      <h2>Materials and Smell Test</h2>
      <p>Genuine leather on Jordans has a soft, slightly textured feel. Fakes often use synthetic materials that feel plasticky or overly smooth. The <a href="/glossary/midsole" class="text-bcs-rust hover:text-bcs-rust2 underline">midsole</a> foam should have a consistent density, not too spongy or too rigid. And yes, the smell test is real: authentic sneakers have a distinct factory smell that is different from the harsh chemical odor of many replicas. While it is not foolproof on its own, combined with other checks it is another data point in your favor.</p>
    `,
  },
  {
    slug: 'history-of-the-nike-dunk',
    title: 'The History of the Nike Dunk: From Basketball to Streetwear',
    excerpt:
      'How a 1985 college basketball shoe became the most sought-after silhouette in streetwear culture.',
    category: 'history',
    tags: ['nike', 'dunk', 'sneaker history'],
    readTime: '6 min read',
    image: u('photo-1623684225794-a8f1f5037f5c'),
    date: '2026-03-08',
    content: `
      <h2>Born on the Court</h2>
      <p>The <a href="/glossary/nike" class="text-bcs-rust hover:text-bcs-rust2 underline">Nike</a> <a href="/glossary/dunk" class="text-bcs-rust hover:text-bcs-rust2 underline">Dunk</a> debuted in 1985 as part of Nike's "Be True to Your School" campaign, designed to outfit college basketball teams across the country. Each <a href="/glossary/colorway" class="text-bcs-rust hover:text-bcs-rust2 underline">colorway</a> matched a different university, from UNLV's red and grey to Michigan's maize and blue. The <a href="/glossary/silhouette" class="text-bcs-rust hover:text-bcs-rust2 underline">silhouette</a> borrowed its sole from the Air Jordan 1 and its upper from the Air Force 1, creating a hybrid that felt immediately familiar yet distinctly its own.</p>

      <h2>The SB Era and Skate Culture</h2>
      <p>By the late 1990s, the Dunk had largely faded from the spotlight, until Nike SB gave it a second life in 2002. Adding Zoom Air insoles and a padded tongue, the Dunk SB became the go-to skate shoe. Limited runs and creative <a href="/glossary/collab" class="text-bcs-rust hover:text-bcs-rust2 underline">collaborations</a> with shops like Supreme, Stussy, and Diamond Supply transformed it from a basketball relic into a streetwear <a href="/glossary/grail" class="text-bcs-rust hover:text-bcs-rust2 underline">grail</a>. The "Pigeon" Dunk famously caused a near-riot outside a New York sneaker shop in 2005, cementing the model's cultural power.</p>

      <h2>The Modern Resurgence</h2>
      <p>The Dunk experienced yet another renaissance starting around 2020, driven by Travis Scott co-signs, viral TikTok styling, and Nike's deliberate <a href="/glossary/retro" class="text-bcs-rust hover:text-bcs-rust2 underline">retro</a> strategy. Suddenly, Dunks were everywhere, from high schoolers to fashion week attendees. Prices on the <a href="/glossary/reseller" class="text-bcs-rust hover:text-bcs-rust2 underline">resale</a> market skyrocketed, with certain colorways commanding ten times their retail price. Today, the Dunk remains one of the most versatile sneakers ever made, equally at home on a skateboard, a basketball court, or the streets of Portland.</p>

      <h2>What Makes the Dunk Timeless</h2>
      <p>The genius of the Dunk is its simplicity. The clean lines and two-tone leather upper serve as a blank canvas for infinite color combinations. Unlike more technically complex shoes that can feel dated after a few years, the Dunk's straightforward design means it always looks current. Whether you prefer the low-top for casual summer wear or the high-top for a bolder statement, the Dunk has earned its place in the sneaker pantheon.</p>
    `,
  },
  {
    slug: 'most-anticipated-sneaker-releases-2026',
    title: 'Top 10 Most Anticipated Sneaker Releases of 2026',
    excerpt:
      'From retro comebacks to brand-new collaborations, here are the drops we cannot wait for this year.',
    category: 'releases',
    tags: ['releases', '2026', 'upcoming drops'],
    readTime: '5 min read',
    image: u('photo-1539185441755-769473a23570'),
    date: '2026-02-28',
    content: `
      <h2>The Drops That Will Define 2026</h2>
      <p>Every year brings a fresh wave of sneaker releases that shape the culture, and 2026 is stacking up to be one of the most exciting yet. From long-awaited <a href="/glossary/retro" class="text-bcs-rust hover:text-bcs-rust2 underline">retros</a> to unexpected collaborations, the calendar is packed with <a href="/glossary/heat" class="text-bcs-rust hover:text-bcs-rust2 underline">heat</a>. Here are the ten releases we are tracking most closely at Bridge City Soles.</p>

      <h2>Retro Comebacks Leading the Pack</h2>
      <ul>
        <li>Air Jordan 4 "Bred Reimagined" - The ultimate <a href="/glossary/og" class="text-bcs-rust hover:text-bcs-rust2 underline">OG</a> <a href="/glossary/colorway" class="text-bcs-rust hover:text-bcs-rust2 underline">colorway</a> returns with premium materials and updated construction</li>
        <li><a href="/glossary/nike" class="text-bcs-rust hover:text-bcs-rust2 underline">Nike</a> Dunk Low "Vintage Navy" - A clean two-tone leather <a href="/glossary/dunk" class="text-bcs-rust hover:text-bcs-rust2 underline">dunk</a> that channels old-school college vibes</li>
        <li>Air Jordan 1 High "Royal Reimagined" - Tumbled leather, no Nike Air branding on the tongue, pure class</li>
        <li><a href="/glossary/new-balance" class="text-bcs-rust hover:text-bcs-rust2 underline">New Balance</a> 990v6 "Grey Day" - The latest evolution of the dad shoe that became a fashion staple</li>
        <li>Nike Air Max 1 "Anniversary Red" - Another run of the shoe that started the visible air revolution</li>
      </ul>

      <h2>Collaborations to Watch</h2>
      <ul>
        <li>A Ma Maniere x Air Jordan 5 - The Atlanta boutique continues its streak of elevated <a href="/glossary/jordan-brand" class="text-bcs-rust hover:text-bcs-rust2 underline">Jordan</a> <a href="/glossary/collab" class="text-bcs-rust hover:text-bcs-rust2 underline">collabs</a></li>
        <li>Salehe Bembury x New Balance 1906R - More organic shapes and unexpected colorways from the designer</li>
        <li>Union LA x Nike Cortez - Chris Gibbs puts his spin on the classic runner</li>
        <li>Kith x Asics Gel-Kayano 14 - Ronnie Fieg always delivers on the Asics front</li>
        <li>Aimé Leon Dore x New Balance 993 - The NYC brand keeps the NB partnership alive with another refined take</li>
      </ul>

      <h2>How to Cop</h2>
      <p>Follow us on Instagram at @bridgecitysolesportland for release date updates and early access opportunities. We stock select releases in store and online, and our consignment program means you can find pairs long after the initial drop sells out.</p>
    `,
  },
  {
    slug: 'how-to-clean-sneakers',
    title: 'How to Clean Your Sneakers Without Ruining Them',
    excerpt:
      'The right cleaning techniques for every material, from suede to mesh to patent leather.',
    category: 'care',
    tags: ['cleaning', 'maintenance', 'care tips'],
    readTime: '6 min read',
    image: u('photo-1603631540004-d7b2616b2323'),
    date: '2026-02-15',
    content: `
      <h2>Know Your Materials First</h2>
      <p>The biggest mistake people make when cleaning sneakers is using a one-size-fits-all approach. Leather, <a href="/glossary/suede" class="text-bcs-rust hover:text-bcs-rust2 underline">suede</a>, <a href="/glossary/nubuck" class="text-bcs-rust hover:text-bcs-rust2 underline">nubuck</a>, mesh, knit, and canvas all require different techniques and products. Using the wrong cleaner or brush on the wrong material can cause permanent damage. Before you scrub anything, identify every material on your shoe and plan your approach accordingly.</p>

      <h2>The Basic Cleaning Kit</h2>
      <ul>
        <li>A soft-bristle brush for uppers and a medium-bristle brush for <a href="/glossary/midsole" class="text-bcs-rust hover:text-bcs-rust2 underline">midsoles</a></li>
        <li>Sneaker-specific cleaner (Jason Markk, Reshoevn8r, or Crep Protect all work well)</li>
        <li>Microfiber towels for wiping and drying</li>
        <li>A suede eraser and brass brush for suede and nubuck panels</li>
        <li>A small bowl of warm water (never hot)</li>
      </ul>

      <h2>Step-by-Step for Leather Sneakers</h2>
      <p>Remove the laces and insoles first. Dip your soft brush into the cleaning solution and work in small circular motions across the leather panels. Do not saturate the shoe; you want the brush damp, not dripping. Wipe each section with a microfiber cloth as you go. For stubborn scuffs, a melamine foam sponge works wonders on smooth leather, but never use it on matte or tumbled finishes. For <a href="/glossary/patent-leather" class="text-bcs-rust hover:text-bcs-rust2 underline">patent leather</a> panels, a damp cloth is usually all you need. Let the shoes air dry at room temperature, away from direct heat or sunlight.</p>

      <h2>Suede and Nubuck: Handle with Care</h2>
      <p>Suede is the most delicate material in sneakers and requires a completely different approach. Start with a dry suede brush to remove surface dust, always brushing in one direction. For stains, use a suede eraser with gentle pressure. If the stain persists, a very lightly dampened brush with suede-specific cleaner can help, but use it sparingly. Never submerge suede sneakers in water. Once clean, apply a suede protector spray to guard against future stains and water damage. Proper care prevents <a href="/glossary/yellowing" class="text-bcs-rust hover:text-bcs-rust2 underline">yellowing</a> on the <a href="/glossary/outsole" class="text-bcs-rust hover:text-bcs-rust2 underline">outsole</a> and keeps your <a href="/glossary/kicks" class="text-bcs-rust hover:text-bcs-rust2 underline">kicks</a> looking fresh.</p>
    `,
  },
  {
    slug: 'portland-sneaker-culture',
    title: "Portland's Sneaker Culture: Why Bridge City is the PNW's Sneaker Capital",
    excerpt:
      'From Nike headquarters to independent shops, Portland has always been at the heart of sneaker culture in the Pacific Northwest.',
    category: 'culture',
    tags: ['portland', 'culture', 'community'],
    readTime: '5 min read',
    image: u('photo-1556906781-9a412961c28c'),
    date: '2026-02-01',
    content: `
      <h2>Nike's Backyard</h2>
      <p>Portland's relationship with sneakers runs deeper than most cities. <a href="/glossary/nike" class="text-bcs-rust hover:text-bcs-rust2 underline">Nike</a>'s world headquarters sits just outside the city in Beaverton, and the brand's DNA is woven into the fabric of the Pacific Northwest. From the original Bowerman track experiments at the University of Oregon to the global empire that is Nike today, the Portland metro area has always been ground zero for sneaker innovation. That proximity has created a city full of people who genuinely care about what goes on their feet.</p>

      <h2>The Independent Scene</h2>
      <p>Beyond Nike, Portland has cultivated a thriving independent sneaker scene. Shops like Bridge City Soles have built communities around buying, selling, and trading authentic <a href="/glossary/kicks" class="text-bcs-rust hover:text-bcs-rust2 underline">kicks</a>. The city's strong small-business culture and appreciation for craft translate directly to the sneaker world, where provenance and authenticity matter. Portland <a href="/glossary/sneakerhead" class="text-bcs-rust hover:text-bcs-rust2 underline">sneakerheads</a> tend to be knowledgeable collectors who value story and quality over hype alone, which makes the local market one of the most interesting in the country.</p>

      <h2>Events and Community</h2>
      <p>Portland hosts regular sneaker events, from organized swap meets to pop-up markets in the Pearl District and Alberta Arts District. These gatherings are more than just commerce; they are community events where people connect over shared passion. Whether you are looking for a rare pair of SB Dunks, trading up from your current <a href="/glossary/rotation" class="text-bcs-rust hover:text-bcs-rust2 underline">rotation</a>, or just want to talk shoes with people who understand the obsession, Portland delivers in a way that few cities can match.</p>

      <h2>Why Portland Will Always Be a Sneaker City</h2>
      <p>The combination of Nike's presence, a strong independent retail scene, an outdoors-oriented population that values quality footwear, and a creative culture that embraces self-expression through style means Portland will always be a sneaker city. At Bridge City Soles, we are proud to be part of that tradition, bringing authenticated <a href="/glossary/heat" class="text-bcs-rust hover:text-bcs-rust2 underline">heat</a> to the PNW one pair at a time.</p>
    `,
  },
  {
    slug: 'sneaker-investing-101',
    title: 'Sneaker Investing 101: Which Kicks Actually Go Up in Value?',
    excerpt:
      'Not every hyped release is a good investment. Learn which factors determine long-term resale value.',
    category: 'guides',
    tags: ['investing', 'resale', 'value'],
    readTime: '7 min read',
    image: u('photo-1681883750582-1d8c190b1b08'),
    date: '2026-01-20',
    content: `
      <h2>The Reality of Sneaker Resale</h2>
      <p>Social media makes it look like every sneaker release is an instant profit opportunity, but the reality is more nuanced. Most sneakers depreciate the moment you take them out of the box. Only a small percentage of releases consistently gain value over time, and understanding what separates those from the rest is the key to making smart decisions with your collection.</p>

      <h2>Factors That Drive Long-Term Value</h2>
      <ul>
        <li>Limited production numbers, especially region-exclusive or friends-and-family pairs</li>
        <li><a href="/glossary/collab" class="text-bcs-rust hover:text-bcs-rust2 underline">Collaboration</a> status with high-profile designers, artists, or brands</li>
        <li>Cultural significance and ties to memorable moments in sports or music</li>
        <li>Condition and completeness, including original box, laces, and hangtags</li>
        <li><a href="/glossary/colorway" class="text-bcs-rust hover:text-bcs-rust2 underline">Colorway</a> appeal that transcends seasonal trends</li>
      </ul>

      <h2>Models That Historically Hold Value</h2>
      <p>Air Jordan 1 Highs in <a href="/glossary/og" class="text-bcs-rust hover:text-bcs-rust2 underline">OG</a> colorways have proven to be among the most reliable long-term holds. The Chicago, Bred, and Royal colorways have appreciated consistently over the past decade. <a href="/glossary/nike" class="text-bcs-rust hover:text-bcs-rust2 underline">Nike</a> <a href="/glossary/dunk" class="text-bcs-rust hover:text-bcs-rust2 underline">Dunk</a> SB collaborations from the early 2000s continue to climb, with certain pairs now worth thousands. Off-White x Nike collaborations, particularly the original "The Ten" collection, have shown strong appreciation. On the <a href="/glossary/new-balance" class="text-bcs-rust hover:text-bcs-rust2 underline">New Balance</a> side, Aimé Leon Dore and Joe Freshgoods collaborations have performed well on the secondary market.</p>

      <h2>Common Mistakes to Avoid</h2>
      <p>Do not buy purely on hype. By the time a shoe is trending on social media, the window for a good entry price has usually closed. Do not overextend your budget on a single pair when diversifying across several releases reduces risk. And never invest money you cannot afford to lose. Sneakers are physical goods that can be damaged, stolen, or simply fall out of fashion. Treat sneaker investing as a hobby that sometimes pays off, not as a financial strategy.</p>
    `,
  },
  {
    slug: 'rise-of-new-balance',
    title: 'The Rise of New Balance: From Dad Shoes to Hype Beast Grails',
    excerpt:
      'How New Balance went from your father\'s walking shoe to one of the most coveted brands in streetwear.',
    category: 'history',
    tags: ['new balance', 'history', 'streetwear'],
    readTime: '6 min read',
    image: u('photo-1662569147750-ef722928ce08'),
    date: '2026-01-10',
    content: `
      <h2>The Quiet Giant</h2>
      <p>For decades, <a href="/glossary/new-balance" class="text-bcs-rust hover:text-bcs-rust2 underline">New Balance</a> occupied a peculiar space in the sneaker world. Respected by runners and podiatrists, dismissed by trend-chasers as the brand your dad wore to mow the lawn. While <a href="/glossary/nike" class="text-bcs-rust hover:text-bcs-rust2 underline">Nike</a> and <a href="/glossary/adidas" class="text-bcs-rust hover:text-bcs-rust2 underline">Adidas</a> fought for cultural relevance with celebrity endorsements and limited drops, New Balance quietly made some of the most technically excellent shoes on the market. The 990 series, first introduced in 1982, was the first sneaker to retail for $100, a statement of quality in an era of disposable athletic footwear.</p>

      <h2>The Turning Point</h2>
      <p>The shift began around 2019 when a handful of influential figures in fashion started wearing New Balance unironically. Brands like Aimé Leon Dore, JJJJound, and Stussy began <a href="/glossary/collab" class="text-bcs-rust hover:text-bcs-rust2 underline">collaborating</a> with New Balance, bringing the brand's classic <a href="/glossary/silhouette" class="text-bcs-rust hover:text-bcs-rust2 underline">silhouettes</a> to a new audience. Teddy Santis, the founder of Aimé Leon Dore, eventually became the creative director of New Balance's Made in USA line, a move that signaled the brand's full embrace of its new cultural position.</p>

      <h2>Why the Appeal Is Real</h2>
      <p>What sets New Balance apart from many hype-driven brands is substance. The Made in USA and Made in UK lines use premium materials and genuine craftsmanship. The shoes are comfortable for all-day wear, not just display pieces. And the brand's decision to keep production volumes relatively low, even on <a href="/glossary/gr-general-release" class="text-bcs-rust hover:text-bcs-rust2 underline">general releases</a>, creates organic scarcity without the manufactured frenzy that plagues other brands. Wearing New Balance has become a signal that you care about quality as much as aesthetics.</p>

      <h2>Key Models to Know</h2>
      <ul>
        <li>990v6 - The flagship dad shoe that started it all, now in its sixth generation</li>
        <li>550 - The <a href="/glossary/retro" class="text-bcs-rust hover:text-bcs-rust2 underline">retro</a> basketball shoe that became a streetwear staple through Aimé Leon Dore</li>
        <li>2002R - The chunky runner with Protection Pack colorways that sell out instantly</li>
        <li>1906R - Salehe Bembury's canvas for organic, sculptural designs</li>
        <li>993 - The cult favorite that Joe Freshgoods and Kith have both elevated</li>
      </ul>
    `,
  },
  {
    slug: 'how-to-store-sneaker-collection',
    title: 'How to Store Your Sneaker Collection Properly',
    excerpt:
      'Yellowing soles, crumbling midsoles, and creased toeboxes are preventable. Here is how to keep your kicks looking fresh for years.',
    category: 'care',
    tags: ['storage', 'preservation', 'collection'],
    readTime: '5 min read',
    image: u('photo-1595950653106-6c9ebd614d3a'),
    date: '2025-12-28',
    content: `
      <h2>The Enemies of Sneaker Preservation</h2>
      <p>Three things destroy sneakers in storage: humidity, direct sunlight, and heat. Humidity accelerates the hydrolysis process that causes <a href="/glossary/midsole" class="text-bcs-rust hover:text-bcs-rust2 underline">midsole</a> foam to crumble and yellow. UV light fades colors and degrades materials. Heat warps glue bonds and can cause delamination. Understanding these threats is the first step to protecting your collection, whether you have five pairs or five hundred.</p>

      <h2>The Ideal Storage Setup</h2>
      <ul>
        <li>Clear drop-front boxes (Container Store or RSTBX) for easy visibility and access</li>
        <li>Silica gel packets inside each box to absorb excess moisture</li>
        <li>Shoe trees or acid-free tissue paper in the <a href="/glossary/toe-box" class="text-bcs-rust hover:text-bcs-rust2 underline">toe boxes</a> to maintain shape</li>
        <li>A climate-controlled room, ideally between 60-70 degrees Fahrenheit with low humidity</li>
        <li>Blackout curtains or opaque shelving if the room gets direct sunlight</li>
      </ul>

      <h2>Long-Term Preservation Techniques</h2>
      <p>For pairs you plan to keep <a href="/glossary/deadstock" class="text-bcs-rust hover:text-bcs-rust2 underline">deadstock</a> for extended periods, consider shrink-wrapping the individual shoes after inserting silica gel packets. This creates a microenvironment that limits air exchange and moisture exposure. Some collectors vacuum-seal their most valuable pairs, though this can create pressure marks on certain materials if not done carefully. Rotate your display pairs periodically so no single pair sits in light for too long.</p>

      <h2>Common Storage Mistakes</h2>
      <p>Never store sneakers in the garage, attic, or any unclimated space. Temperature swings in these areas accelerate deterioration faster than almost anything else, leading to <a href="/glossary/yellowing" class="text-bcs-rust hover:text-bcs-rust2 underline">yellowing</a>, <a href="/glossary/sole-separation" class="text-bcs-rust hover:text-bcs-rust2 underline">sole separation</a>, and <a href="/glossary/creasing" class="text-bcs-rust hover:text-bcs-rust2 underline">creasing</a>. Avoid stacking boxes too high, as weight can crush the shoes below. Do not store sneakers in their original cardboard boxes long-term without additional protection, as cardboard absorbs and releases moisture with changing conditions. And never store dirty sneakers; clean them first, as dirt and grime can set permanently over time and attract insects.</p>
    `,
  },
  {
    slug: 'ultimate-guide-sneaker-condition-grades',
    title: 'The Ultimate Guide to Sneaker Condition Grades',
    excerpt:
      'From Deadstock to Beat, understanding sneaker condition grades is essential for buying, selling, and trading kicks at the right price.',
    category: 'guides',
    tags: ['condition', 'grading', 'buying tips', 'selling'],
    readTime: '8 min read',
    image: u('photo-1608551279748-73f47931de2c'),
    date: '2026-03-25',
    content: `
      <h2>Why Condition Grading Matters</h2>
      <p>Whether you are buying your first pair of used sneakers or listing a pair for resale, understanding condition grades is one of the most important skills in the sneaker game. A single grade difference can mean hundreds of dollars in price variation, and misrepresenting condition is the fastest way to lose credibility in the community. At Bridge City Soles, we grade every pair that comes through our doors using a standardized system, and we believe every collector should know what each grade means. This guide walks you through every condition tier from top to bottom, explains what to look for when evaluating a pair, and shares tips for keeping your sneakers in the best possible shape.</p>

      <h2>Deadstock (DS): The Gold Standard</h2>
      <p><a href="/glossary/deadstock" class="text-bcs-rust hover:text-bcs-rust2 underline">Deadstock</a> means the shoe has never been worn. Period. No trying on, no walking around the house, no quick fit check at the store. A true <a href="/glossary/ds" class="text-bcs-rust hover:text-bcs-rust2 underline">DS</a> pair will have zero signs of wear on the outsole, a pristine upper with no creases, and should come with all original accessories including the box, extra laces, and any hang tags. The insole should show no foot imprint whatsoever. Deadstock is the gold standard for collectors and commands the highest prices on the resale market. When buying DS pairs, always check the outsole for any scuffing that would indicate the shoes have touched pavement, and inspect the insole for any compression marks.</p>

      <h2>VNDS: Very Near Deadstock</h2>
      <p><a href="/glossary/vnds" class="text-bcs-rust hover:text-bcs-rust2 underline">VNDS</a> means the shoe has been worn once or twice but shows minimal signs of use. You might see a very slight mark on the outsole or the faintest hint of an insole imprint, but the upper should be essentially flawless with no creasing. VNDS pairs are popular with buyers looking for a near-new experience at a lower price point than deadstock. The price gap between DS and VNDS can be anywhere from ten to thirty percent depending on the model and demand, making VNDS an excellent value proposition for wearers who do not plan to keep their kicks on a shelf.</p>

      <h2>Excellent Condition</h2>
      <p>An <a href="/glossary/excellent" class="text-bcs-rust hover:text-bcs-rust2 underline">Excellent</a> condition pair has been worn a handful of times but is still in outstanding shape. There may be very light creasing on the <a href="/glossary/toe-box" class="text-bcs-rust hover:text-bcs-rust2 underline">toe box</a>, minimal outsole wear, and a slight insole imprint, but no stains, scuffs, or material damage. The shoe should look like it was well cared for by someone who rotated their collection frequently. At this grade, you can expect to pay roughly fifty to seventy percent of deadstock resale price depending on the model.</p>

      <h2>Very Good Condition</h2>
      <p>A <a href="/glossary/very-good" class="text-bcs-rust hover:text-bcs-rust2 underline">Very Good</a> pair shows clear signs of regular wear but remains in strong overall shape. Expect moderate <a href="/glossary/toebox-crease" class="text-bcs-rust hover:text-bcs-rust2 underline">toebox creasing</a>, noticeable outsole wear patterns, and a visible insole imprint. There should be no major stains, tears, or structural issues. The shoe is still very presentable on foot and has plenty of life left. This is often the sweet spot for buyers who want to actually wear their sneakers daily without worrying about every step.</p>

      <h2>Good and Fair Condition</h2>
      <p><a href="/glossary/good" class="text-bcs-rust hover:text-bcs-rust2 underline">Good</a> condition means the shoe has been worn regularly and shows it. Heavy creasing, visible outsole wear, possible minor discoloration, and general signs of a well-loved pair. The shoe is still structurally sound and <a href="/glossary/wearable" class="text-bcs-rust hover:text-bcs-rust2 underline">wearable</a> but would not fool anyone into thinking it is new. <a href="/glossary/fair" class="text-bcs-rust hover:text-bcs-rust2 underline">Fair</a> condition takes it a step further with significant wear, possible small stains, and noticeable aging. Fair pairs are often bought by people who want a specific silhouette at the lowest possible price or plan to do a <a href="/glossary/restoration" class="text-bcs-rust hover:text-bcs-rust2 underline">restoration</a> project.</p>

      <h2>Worn and Beat: The Bottom of the Scale</h2>
      <p><a href="/glossary/worn" class="text-bcs-rust hover:text-bcs-rust2 underline">Worn</a> condition indicates heavy use with major creasing, significant outsole wear, possible stains, and general aging throughout the shoe. <a href="/glossary/beat" class="text-bcs-rust hover:text-bcs-rust2 underline">Beat</a> is the lowest grade, reserved for shoes that have been through serious wear and may have structural issues like <a href="/glossary/sole-separation" class="text-bcs-rust hover:text-bcs-rust2 underline">sole separation</a> or material tears. Some collectors refer to heavily worn everyday pairs as <a href="/glossary/beaters" class="text-bcs-rust hover:text-bcs-rust2 underline">beaters</a>, shoes they wear without worrying about condition. Beat pairs can still have value, especially for rare or discontinued models, but expect prices to be a fraction of deadstock value.</p>

      <h2>Key Flaws to Watch For</h2>
      <p>When evaluating any used pair, pay close attention to these common issues that affect both grade and price:</p>
      <ul>
        <li><a href="/glossary/yellowing" class="text-bcs-rust hover:text-bcs-rust2 underline">Yellowing</a> on the midsole or outsole, especially on shoes with icy soles or white foam. This is caused by oxidation and UV exposure and is largely irreversible without professional treatment.</li>
        <li><a href="/glossary/creasing" class="text-bcs-rust hover:text-bcs-rust2 underline">Creasing</a> on the toe box and collar area. Some creasing is inevitable with wear, but deep creases that distort the shoe's shape will significantly drop the grade.</li>
        <li>Sole separation where the midsole begins to pull away from the upper. Minor separation can be re-glued, but extensive separation indicates the adhesive has failed throughout the shoe.</li>
        <li><a href="/glossary/crumbling" class="text-bcs-rust hover:text-bcs-rust2 underline">Crumbling</a> midsoles, particularly on older retro pairs. Polyurethane foam breaks down over time through hydrolysis, and once crumbling starts it cannot be reversed without a <a href="/glossary/sole-swap" class="text-bcs-rust hover:text-bcs-rust2 underline">sole swap</a>.</li>
        <li>Stains, paint transfer, and discoloration on the upper materials.</li>
        <li>Missing accessories like the original box, extra laces, or special packaging. An <a href="/glossary/og" class="text-bcs-rust hover:text-bcs-rust2 underline">OG</a> all pair with everything included will always command a premium over a pair missing its box.</li>
      </ul>

      <h2>How Condition Affects Pricing</h2>
      <p>As a general rule of thumb, each step down the condition scale reduces the price by roughly fifteen to twenty-five percent from the tier above it. A DS pair of Jordan 1 Chicagos might sell for a thousand dollars while a VNDS pair goes for eight hundred, an Excellent pair for six hundred, and a Good pair for three to four hundred. These percentages vary by model, rarity, and demand, but the principle holds across most sneakers. Rare and limited pairs tend to hold more value even in lower conditions because supply is so constrained.</p>

      <h2>Tips for Maintaining Your Sneakers</h2>
      <p>Preserving condition starts the moment you unbox a pair. Here are our top recommendations for keeping your kicks in the highest grade possible:</p>
      <ul>
        <li>Use sneaker shields or force fields inside the toe box to prevent creasing while wearing.</li>
        <li>Clean your shoes after every wear with a soft brush and sneaker-specific cleaning solution.</li>
        <li>Store in a cool, dry, dark environment with silica gel packets to prevent yellowing and crumbling.</li>
        <li>Rotate your collection so no single pair takes excessive wear. Build a solid <a href="/glossary/rotation" class="text-bcs-rust hover:text-bcs-rust2 underline">rotation</a> and your shoes will last years longer.</li>
        <li>Apply water and stain repellent spray to suede and nubuck pairs before wearing.</li>
        <li>Use shoe trees or stuff with acid-free tissue paper when not wearing to maintain shape.</li>
        <li>Avoid wearing premium pairs in rain, mud, or rough terrain. Save those conditions for your beaters.</li>
      </ul>
      <p>Understanding condition grades empowers you as both a buyer and a seller. At Bridge City Soles, we pride ourselves on honest, transparent grading on every pair in our inventory. Stop by the shop or browse our online collection to see condition grading done right.</p>
    `,
  },
  {
    slug: 'sneaker-collabs-that-changed-the-game',
    title: 'Sneaker Collabs That Changed the Game Forever',
    excerpt:
      'From Travis Scott to Off-White, these collaborations redefined what a sneaker release could be and reshaped the entire industry.',
    category: 'culture',
    tags: ['collaborations', 'culture', 'history', 'hype'],
    readTime: '9 min read',
    image: u('photo-1597045566677-8cf032ed6634'),
    date: '2026-03-20',
    content: `
      <h2>The Power of the Collaboration</h2>
      <p>In the sneaker world, few things generate as much excitement as a <a href="/glossary/collab" class="text-bcs-rust hover:text-bcs-rust2 underline">collab</a>. When a brand partners with a designer, artist, retailer, or celebrity to create a limited-edition shoe, the result is often something far greater than the sum of its parts. Collaborations bring fresh perspectives to classic silhouettes, create cultural moments that transcend footwear, and command premium prices on the resale market for years after release. But not all collabs are created equal. Some fade into obscurity within weeks while others become defining moments in sneaker history. Let us look at the collaborations that truly changed the game and explore why the <a href="/glossary/x-collaboration" class="text-bcs-rust hover:text-bcs-rust2 underline">"x" in a collaboration</a> carries so much weight.</p>

      <h2>Travis Scott x Jordan Brand: The New Blueprint</h2>
      <p>When Travis Scott debuted his reverse-Swoosh Air Jordan 1 in 2019, it did not just sell out instantly; it rewrote the rules for celebrity sneaker partnerships. The backwards Swoosh was a bold design choice that initially divided opinion but quickly became one of the most iconic design elements in modern sneaker history. What made the Travis Scott x Jordan partnership different was that Travis was not just lending his name to a colorway. He was actively involved in the design process, flipping established design language on its head. The mocha suede, the hidden stash pocket, the mismatched laces, every detail told a story. The shoe became a <a href="/glossary/grail" class="text-bcs-rust hover:text-bcs-rust2 underline">grail</a> overnight and has maintained its resale premium years later, proving that genuine creative collaboration produces lasting value.</p>

      <h2>Off-White x Nike: Deconstructing the Classics</h2>
      <p>Virgil Abloh's "The Ten" collection in 2017 was a seismic event in sneaker culture. By taking ten iconic Nike silhouettes and deconstructing them with exposed foam, visible stitching, zip ties, and his signature quotation mark branding, Virgil created a new visual language that influenced sneaker design industry-wide for years. The collection was pure <a href="/glossary/heat" class="text-bcs-rust hover:text-bcs-rust2 underline">heat</a> from top to bottom. The Air Jordan 1 "Chicago" from The Ten remains one of the most valuable sneakers of the modern era, regularly selling for thousands on the secondary market. What Virgil understood was that sneakers are not just shoes; they are cultural artifacts, and treating them as such through an art and fashion lens elevated the entire conversation around footwear.</p>

      <h2>Concepts x Nike SB: Storytelling Through Sneakers</h2>
      <p>Boston boutique Concepts has been creating some of the most thoughtful sneaker collaborations for over two decades. Their Lobster Dunk series, which started with the Red Lobster SB Dunk in 2008, demonstrated that a sneaker collab could tell a deeply personal story rooted in local culture. Each Lobster colorway, from red to blue to green to purple, references the rarity of different lobster varieties found off the New England coast. The attention to detail, including the rubber band lace lock that mimics the bands on a lobster's claws, showed that collaborations could be both commercially successful and genuinely creative. The original Red Lobster now commands thousands on the resale market.</p>

      <h2>The Tier System: Quickstrike, Hyperstrike, and Tier Zero</h2>
      <p>Understanding why certain collabs are more valuable than others requires knowledge of the tier system that brands use to distribute limited releases. A <a href="/glossary/quickstrike" class="text-bcs-rust hover:text-bcs-rust2 underline">Quickstrike</a> release is limited but still available at select retailers, typically with little advance notice. A <a href="/glossary/hyperstrike" class="text-bcs-rust hover:text-bcs-rust2 underline">Hyperstrike</a> is even more limited, often restricted to a single retailer or a handful of doors worldwide. <a href="/glossary/tier-zero" class="text-bcs-rust hover:text-bcs-rust2 underline">Tier Zero</a> accounts are the highest-level retail partners that get access to the most exclusive products. The tier at which a collab releases directly affects its scarcity and, consequently, its resale value. A Hyperstrike collab might see only a few hundred pairs produced globally, making it astronomically more rare than a general release collaboration that ships to hundreds of stores.</p>

      <h2>Why Some Collabs Become Grails</h2>
      <p>Not every collaboration becomes a grail. The sneaker world has seen plenty of high-profile partnerships that generated initial buzz but failed to maintain long-term cultural relevance. The collabs that endure share several characteristics. First, they bring a genuinely new perspective to the silhouette rather than just slapping a logo on an existing design. Second, they have a compelling story or concept that gives the shoe meaning beyond its appearance. Third, they are produced in quantities limited enough to maintain exclusivity but not so limited that nobody ever sees them on feet. And fourth, the collaborator has genuine credibility within their field, whether that is fashion, music, art, skateboarding, or retail.</p>

      <h2>The Boutique Collaborator Era</h2>
      <p>Before celebrities dominated the collab landscape, independent sneaker boutiques were the primary collaborators driving the culture forward. Shops like Undefeated, Patta, Kith, Union LA, and A Ma Maniere built their reputations partly through the strength of their brand partnerships. These boutique collabs often featured more subtle design work and deeper storytelling than celebrity partnerships. The Union LA x Air Jordan 4 "Guava Ice," for example, featured a unique unfinished fold-over design on the collar that was unlike anything Jordan Brand had done before. Kith founder Ronnie Fieg's work with <a href="/glossary/asics" class="text-bcs-rust hover:text-bcs-rust2 underline">Asics</a> practically singlehandedly revived the Gel-Lyte III as a cultural force.</p>

      <h2>The Impact on the Broader Market</h2>
      <p>Collaborations have fundamentally reshaped the sneaker industry. They have proven that consumers will pay premium prices for creativity and exclusivity. They have turned retail partnerships into cultural events. They have elevated sneaker designers to the same status as fashion designers. And they have created an entirely new economy around limited-edition footwear. For <a href="/glossary/sneakerhead" class="text-bcs-rust hover:text-bcs-rust2 underline">sneakerheads</a>, collabs represent the intersection of art, commerce, and culture that makes this hobby endlessly fascinating. Whether you are chasing the latest <a href="/glossary/hypebeast" class="text-bcs-rust hover:text-bcs-rust2 underline">hypebeast</a> drop or hunting for a vintage boutique collaboration, the world of sneaker collabs offers something for every type of collector.</p>
      <p>At Bridge City Soles, we carry authenticated collab pairs from across the spectrum, from current releases to vintage gems. Visit us in Portland or shop online to add your next grail collaboration to the collection.</p>
    `,
  },
  {
    slug: 'how-to-win-sneaker-raffles',
    title: 'How to Win Sneaker Raffles: Tips from the Pros',
    excerpt:
      'Increase your odds on SNKRS, in-store draws, and online raffles with proven strategies from experienced sneakerheads.',
    category: 'guides',
    tags: ['raffles', 'SNKRS', 'buying tips', 'releases'],
    readTime: '8 min read',
    image: u('photo-1539185441755-769473a23570'),
    date: '2026-03-12',
    content: `
      <h2>The Modern Sneaker Buying Landscape</h2>
      <p>Gone are the days when you could simply walk into a store and buy the sneakers you wanted. For any remotely hyped release, the buying process now involves some form of <a href="/glossary/raffle" class="text-bcs-rust hover:text-bcs-rust2 underline">raffle</a> system designed to give everyone a fair chance at purchasing. Whether it is the Nike <a href="/glossary/snkrs" class="text-bcs-rust hover:text-bcs-rust2 underline">SNKRS</a> app, an in-store draw at your local sneaker boutique, or an online raffle through a retailer's website, understanding how each system works and optimizing your approach can meaningfully increase your chances of hitting on the pairs you want. This guide compiles strategies from seasoned collectors who have been navigating the raffle ecosystem for years.</p>

      <h2>Understanding the SNKRS App</h2>
      <p>Nike's SNKRS app is the primary battleground for most hyped Nike and Jordan releases. The app uses two main formats: the Draw and the LEO (Let Everyone Order). The Draw opens a window, usually ten minutes, during which everyone can enter, and winners are selected randomly at the end. The LEO is more of a first-come-first-served sprint where the app processes entries as they come in, though Nike has never fully confirmed the mechanics. Here are strategies that experienced SNKRS users swear by:</p>
      <ul>
        <li>Keep your payment information and shipping address up to date at all times. Failed payment processing means a lost pair even if you win.</li>
        <li>Engage with the app regularly. Watch the content, read the stories, interact with Upcoming drops. There is widespread belief that account activity influences the algorithm, though Nike has never confirmed this.</li>
        <li>Enter on Draw releases during the full window, not just at the last second. For LEO drops, be ready the moment the notification hits.</li>
        <li>Have a strong and stable internet connection. Wi-Fi is generally more reliable than cellular during high-traffic drops.</li>
        <li>Do not use multiple accounts. Nike actively detects and bans duplicate accounts, and losing your primary account is not worth the risk.</li>
      </ul>

      <h2>In-Store Raffles and Campouts</h2>
      <p>Many independent sneaker shops run their own raffle systems for limited releases. These typically involve registering in person or online during a specific window, then waiting for a notification if you win. In-store raffles are often your best odds because the entry pool is limited to the local area. Some stores still do <a href="/glossary/fcfs" class="text-bcs-rust hover:text-bcs-rust2 underline">first-come-first-served</a> releases, which may involve a <a href="/glossary/campout" class="text-bcs-rust hover:text-bcs-rust2 underline">campout</a> the night before. While campouts have become less common, they still happen for certain high-profile drops, especially at stores that value community engagement over online convenience.</p>
      <p>Tips for maximizing in-store success:</p>
      <ul>
        <li>Build genuine relationships with your local shops. Staff remember faces, and being a regular customer who buys non-hyped releases too goes a long way.</li>
        <li>Follow the store's social media closely for raffle announcements. Entry windows can be short and easily missed.</li>
        <li>Read the rules carefully. Some stores require you to pick up in person within a specific timeframe if you win.</li>
        <li>Enter every raffle you qualify for, even if the shoe is not your top priority. Consistent entries build your profile as an active community member.</li>
      </ul>

      <h2>Online Raffles: Casting a Wide Net</h2>
      <p>Beyond SNKRS and local shops, dozens of online retailers run raffles for limited releases. Sites like END, SNS, Bodega, Kith, and countless others each run independent draws. The strategy here is volume: the more raffles you enter, the better your statistical odds. Some collectors enter twenty or more raffles for a single release. Create a list of every retailer that carries the brand you are interested in and bookmark their raffle pages. Most online raffles are free to enter and only charge your payment method if you win, so there is no financial risk in entering broadly.</p>

      <h2>FCFS vs Raffle: Different Strategies</h2>
      <p>First-come-first-served drops reward speed and preparation. Have your payment saved, your size selected, and your fingers ready. Raffle drops reward patience and volume. Understanding which format a retailer is using for each release allows you to allocate your energy appropriately. There is no point stressing about being first in line for a raffle, and there is no point casually checking a FCFS drop twenty minutes after it opens. For <a href="/glossary/gr-general-release" class="text-bcs-rust hover:text-bcs-rust2 underline">general releases</a>, FCFS is usually fine since stock levels are high enough that quick action guarantees a pair.</p>

      <h2>The Backdoor Problem</h2>
      <p>Let us address the elephant in the room. <a href="/glossary/backdoor" class="text-bcs-rust hover:text-bcs-rust2 underline">Backdoor</a> pairs are shoes that are sold before the official release, often by store employees or through connections, bypassing the raffle system entirely. Some people use a <a href="/glossary/plug" class="text-bcs-rust hover:text-bcs-rust2 underline">plug</a>, an insider connection who can secure pairs through unofficial channels. While backdooring is technically against retailer policies and brand agreements, it happens at every level of the industry. Our advice: focus on legitimate channels. Building your sneaker collection through honest means is more sustainable and more satisfying long-term, and you avoid the risk of receiving fakes or getting scammed by unreliable connections.</p>

      <h2>Managing Expectations</h2>
      <p>Here is the hard truth: even with perfect strategy, you will lose far more raffles than you win. Limited releases are limited for a reason, and demand almost always far exceeds supply. A realistic hit rate for hyped releases is somewhere between five and fifteen percent if you are entering multiple raffles per drop. Accepting this reality prevents frustration and keeps the hobby enjoyable. When you do hit, it feels that much sweeter. And when you miss, remember that the secondary market always has pairs available, it just costs more. Shops like Bridge City Soles exist precisely for this reason, to give you another shot at the pairs you missed through official channels.</p>

      <h2>Building a Long-Term Strategy</h2>
      <p>The most successful collectors approach buying as a marathon, not a sprint. They build relationships with local stores, maintain active accounts across multiple platforms, stay informed about release calendars, and enter consistently over time. They also know when to pay resale and when to wait, because prices on some releases drop after the initial hype fades. Some shoes that seemed impossible to get at launch are sitting on shelves six months later. Patience, persistence, and a genuine love for sneakers will serve you better than any single trick or hack.</p>
      <p>Bridge City Soles carries both new releases and consignment pairs for those times when the raffle gods are not smiling on you. Visit us in Portland or check our online inventory to find your next pair.</p>
    `,
  },
  {
    slug: 'understanding-sneaker-materials',
    title: "Understanding Sneaker Materials: What's on Your Feet?",
    excerpt:
      'From nubuck to Flyknit to Boost foam, a complete breakdown of the materials and technologies that define modern sneakers.',
    category: 'guides',
    tags: ['materials', 'technology', 'education', 'comfort'],
    readTime: '9 min read',
    image: u('photo-1622760808027-095ea611f657'),
    date: '2026-03-05',
    content: `
      <h2>Why Materials Matter</h2>
      <p>Every sneaker is a combination of materials engineered for comfort, durability, style, or some balance of all three. Understanding what goes into your shoes helps you make better buying decisions, care for your collection properly, and appreciate the design choices that brands make. Whether you are deciding between two colorways of the same model or comparing shoes from different brands entirely, material knowledge is your secret weapon. This guide covers the most common upper materials and cushioning technologies you will encounter in today's sneaker market.</p>

      <h2>Leather Types: The Foundation of Classic Sneakers</h2>
      <p>Leather has been the primary material in sneaker construction since the earliest basketball shoes, and it remains dominant in retro and lifestyle silhouettes today. But not all leather is the same.</p>
      <p><a href="/glossary/nubuck" class="text-bcs-rust hover:text-bcs-rust2 underline">Nubuck</a> is a type of top-grain leather that has been sanded or buffed on the outer surface to create a soft, velvety texture. It is thicker and more durable than suede but requires similar care. You will find nubuck on shoes like the Air Jordan 4 and Timberland boots. It ages beautifully when cared for but is susceptible to water stains and scuffing.</p>
      <p><a href="/glossary/suede" class="text-bcs-rust hover:text-bcs-rust2 underline">Suede</a> comes from the inner split of the hide, giving it a softer, more napped texture than nubuck. It is lighter and more flexible but also more delicate. Suede panels are common on New Balance models, Puma classics, and many Nike SB Dunks. Proper maintenance with a suede brush and protector spray is essential.</p>
      <p><a href="/glossary/patent-leather" class="text-bcs-rust hover:text-bcs-rust2 underline">Patent leather</a> features a high-gloss, mirror-like finish achieved through a lacquer coating. It is eye-catching and relatively easy to clean but can crack if flexed repeatedly or stored improperly. The Air Jordan 11 is the most famous example of patent leather in sneakers, where it wraps the mudguard in that distinctive shiny finish.</p>
      <p><a href="/glossary/tumbled-leather" class="text-bcs-rust hover:text-bcs-rust2 underline">Tumbled leather</a> has been mechanically softened to create a pebbled, textured surface. It is more forgiving of creasing than smooth leather and has a relaxed, premium feel. Many Jordan 1 retro releases use tumbled leather for a more luxurious hand feel compared to the stiffer smooth leather of earlier retros.</p>

      <h2>Engineered Textiles: The Modern Revolution</h2>
      <p>Nike's <a href="/glossary/flyknit" class="text-bcs-rust hover:text-bcs-rust2 underline">Flyknit</a> technology, introduced in 2012, changed the game by using computer-programmed knitting to create lightweight, form-fitting uppers from a single piece of yarn. Flyknit allows Nike to vary the knit density in different zones of the shoe, providing support where needed and breathability elsewhere. The technology dramatically reduced material waste in production and created a sock-like fit that many runners and lifestyle wearers love.</p>
      <p>Adidas answered with <a href="/glossary/primeknit" class="text-bcs-rust hover:text-bcs-rust2 underline">Primeknit</a>, their own engineered knit upper technology. Primeknit uses a similar concept of varying knit structures across the upper but with a slightly different yarn composition and construction method. It became synonymous with the Yeezy 350 and Ultra Boost lines, contributing to the sock-like aesthetic that defined sneaker fashion in the mid-2010s.</p>
      <p><a href="/glossary/gore-tex" class="text-bcs-rust hover:text-bcs-rust2 underline">Gore-Tex</a> is a waterproof, breathable membrane that several brands incorporate into sneakers designed for all-weather wear. Nike, Adidas, New Balance, and Asics all offer Gore-Tex versions of popular models. These are ideal for rainy climates but typically sacrifice some breathability and add a small amount of weight compared to non-waterproof versions.</p>

      <h2>Cushioning Technologies: What You Stand On</h2>
      <p>The <a href="/glossary/midsole" class="text-bcs-rust hover:text-bcs-rust2 underline">midsole</a> is where the real technology lives. Adidas <a href="/glossary/boost" class="text-bcs-rust hover:text-bcs-rust2 underline">Boost</a> foam, made from thousands of expanded thermoplastic polyurethane pellets, was a revelation when it debuted in 2013. Boost provides exceptional energy return, meaning the foam bounces back aggressively with every step. It is also remarkably durable, maintaining its cushioning properties long after traditional foams would have compressed and flattened. The distinctive pellet texture on the midsole makes Boost-equipped shoes instantly recognizable.</p>
      <p>Nike <a href="/glossary/react" class="text-bcs-rust hover:text-bcs-rust2 underline">React</a> foam is Nike's answer to Boost, offering a smooth, responsive ride that balances cushioning with stability. React is lighter than Boost and has a more uniform look, without the pellet texture. It appears in everything from running shoes to lifestyle models like the React Element 87.</p>
      <p>Nike <a href="/glossary/zoom-air" class="text-bcs-rust hover:text-bcs-rust2 underline">Zoom Air</a> uses pressurized air units with tightly stretched tensile fibers inside. When compressed, the fibers snap back quickly, providing a responsive, bouncy feel that is thinner than traditional air units. Zoom Air is particularly popular in basketball shoes and performance runners where court feel matters.</p>

      <h2>The Air Max Legacy</h2>
      <p>Nike <a href="/glossary/air-max" class="text-bcs-rust hover:text-bcs-rust2 underline">Air Max</a> technology dates back to 1987 when Tinker Hatfield introduced <a href="/glossary/visible-air" class="text-bcs-rust hover:text-bcs-rust2 underline">visible Air</a> on the Air Max 1. The concept of showing the cushioning technology through a window in the midsole was revolutionary and spawned an entire lineage of shoes. <a href="/glossary/full-length-air" class="text-bcs-rust hover:text-bcs-rust2 underline">Full-length Air</a> units, as seen in the Air Max 97 and Air Max 720, provide cushioning across the entire foot. The Air Max line has become as much about visual design as it is about performance, with the visible air unit serving as both a functional element and a design signature.</p>

      <h2>Traditional Foams and Their Role</h2>
      <p><a href="/glossary/eva" class="text-bcs-rust hover:text-bcs-rust2 underline">EVA</a> (ethylene-vinyl acetate) is the most basic and widely used midsole foam in the industry. It is lightweight and affordable but compresses over time, losing cushioning with extended wear. <a href="/glossary/phylon" class="text-bcs-rust hover:text-bcs-rust2 underline">Phylon</a> is a compression-molded EVA that Nike uses extensively. It is a step up from basic EVA in terms of consistency and durability. <a href="/glossary/lunarlon" class="text-bcs-rust hover:text-bcs-rust2 underline">Lunarlon</a> was Nike's soft, bouncy foam that appeared in many models from 2008 to 2018 before being largely replaced by React.</p>

      <h2>The Outsole and Other Components</h2>
      <p>The <a href="/glossary/outsole" class="text-bcs-rust hover:text-bcs-rust2 underline">outsole</a> is the bottom of the shoe that contacts the ground. Most sneaker outsoles are made from rubber, with carbon rubber being the most durable option for high-wear areas. An <a href="/glossary/icy-sole" class="text-bcs-rust hover:text-bcs-rust2 underline">icy sole</a> refers to a translucent outsole, often with a blue or clear tint, that looks incredible fresh but is prone to yellowing over time. The <a href="/glossary/tongue" class="text-bcs-rust hover:text-bcs-rust2 underline">tongue</a>, <a href="/glossary/insole" class="text-bcs-rust hover:text-bcs-rust2 underline">insole</a>, <a href="/glossary/heel-tab" class="text-bcs-rust hover:text-bcs-rust2 underline">heel tab</a>, and <a href="/glossary/lace-lock" class="text-bcs-rust hover:text-bcs-rust2 underline">lace lock</a> are all additional components that vary between models and contribute to both function and aesthetic.</p>

      <h2>Making Informed Buying Decisions</h2>
      <p>Understanding materials helps you match the right shoe to the right purpose. If you need all-day comfort, prioritize Boost or React cushioning. If you want a shoe that ages gracefully and develops character, look for premium leather or suede. If you live in a rainy climate, Gore-Tex options save your feet and your investment. And if you are buying for long-term storage or collection, know that certain materials like polyurethane foam and icy soles degrade over time regardless of how carefully you store them. Knowledge is power in the sneaker game, and the more you understand about what goes into your shoes, the better choices you will make.</p>
    `,
  },
  {
    slug: 'resellers-playbook-how-sneaker-reselling-works',
    title: "The Reseller's Playbook: How Sneaker Reselling Actually Works",
    excerpt:
      'An honest look inside the sneaker resale ecosystem, from sourcing pairs to pricing strategy to the platforms where deals happen.',
    category: 'culture',
    tags: ['reselling', 'business', 'marketplace', 'pricing'],
    readTime: '9 min read',
    image: u('photo-1681883750582-1d8c190b1b08'),
    date: '2026-02-22',
    content: `
      <h2>The Billion-Dollar Aftermarket</h2>
      <p>Sneaker reselling has grown from a niche hobby into a multi-billion-dollar global industry. What started as friends trading shoes in parking lots has evolved into a sophisticated marketplace with professional platforms, authentication services, and full-time operators. Whether you view <a href="/glossary/reseller" class="text-bcs-rust hover:text-bcs-rust2 underline">resellers</a> as entrepreneurs providing a valuable service or as middlemen inflating prices, understanding how the resale ecosystem works gives you a significant advantage as a buyer, seller, or collector. This guide breaks down the mechanics of sneaker reselling without sugarcoating the realities.</p>

      <h2>How Resellers Source Their Inventory</h2>
      <p>Successful resellers use multiple channels to acquire inventory, and diversification is key. The most straightforward method is buying retail through official channels like the <a href="/glossary/snkrs" class="text-bcs-rust hover:text-bcs-rust2 underline">SNKRS</a> app, brand websites, and authorized retailers. This is the most legitimate sourcing method but also the most competitive, with hit rates on hyped releases typically in the single digits. Many resellers also participate in every available <a href="/glossary/raffle" class="text-bcs-rust hover:text-bcs-rust2 underline">raffle</a> for a given release, both online and in-store, to maximize their chances of securing pairs at retail price.</p>
      <p>The more controversial sourcing methods include <a href="/glossary/backdoor" class="text-bcs-rust hover:text-bcs-rust2 underline">backdoor</a> connections where store employees sell pairs before the official release date, often at a markup above retail but below market price. Having a <a href="/glossary/plug" class="text-bcs-rust hover:text-bcs-rust2 underline">plug</a> in the right store can provide consistent access to limited releases. While these practices violate retailer agreements, they are widespread enough to be a significant part of the supply chain. Some larger reselling operations also buy from other resellers in bulk at a slight discount, essentially acting as wholesalers in the secondary market.</p>

      <h2>Understanding Pricing: Bricks vs Heat</h2>
      <p>Not every limited release is profitable. The sneaker community has a clear vocabulary for distinguishing between shoes that perform well on the resale market and those that do not. <a href="/glossary/heat" class="text-bcs-rust hover:text-bcs-rust2 underline">Heat</a> refers to shoes that are highly coveted, commanding significant premiums over retail price. A shoe is heat when demand far outstrips supply and the cultural cachet is strong. On the other end of the spectrum, a <a href="/glossary/brick" class="text-bcs-rust hover:text-bcs-rust2 underline">brick</a> is a shoe that nobody wants, often selling at or below retail on the secondary market. Getting stuck holding bricks is the biggest financial risk for resellers.</p>
      <p>The dream scenario for any reseller is the <a href="/glossary/triple-up" class="text-bcs-rust hover:text-bcs-rust2 underline">triple up</a>, where a shoe sells for three times its retail price or more on the resale market. Triple ups are rare and typically only happen with highly limited collaborations, special editions, or shoes tied to major cultural moments. A more realistic expectation for consistently profitable releases is a thirty to sixty percent markup over retail after accounting for fees, shipping, and taxes.</p>

      <h2>Condition Grading and Its Impact on Price</h2>
      <p>Condition is everything in resale. A <a href="/glossary/deadstock" class="text-bcs-rust hover:text-bcs-rust2 underline">Deadstock</a> pair will always command the highest price because buyers know exactly what they are getting: an unworn shoe in original condition. <a href="/glossary/vnds" class="text-bcs-rust hover:text-bcs-rust2 underline">VNDS</a> pairs typically sell for ten to twenty percent less than DS depending on the model. The drop-off accelerates from there, with each condition grade below VNDS reducing the price further. For resellers, this means that how you store and handle your inventory directly affects your bottom line. A pair that drops from DS to Excellent because of a careless try-on just lost you money.</p>

      <h2>The Major Platforms</h2>
      <p>The sneaker resale ecosystem is served by several major platforms, each with its own strengths and fee structures:</p>
      <ul>
        <li>StockX operates as a stock market for sneakers, with anonymous buyers and sellers agreeing on a price through a bid/ask system. StockX authenticates every pair that passes through their facility. Seller fees range from eight to ten percent plus payment processing.</li>
        <li>GOAT offers a similar authentication service but also allows sellers to list used pairs, which StockX does not. GOAT takes a commission of nine and a half percent on standard seller accounts plus a cash-out fee.</li>
        <li>eBay has re-entered the authenticated sneaker space with their Authenticity Guarantee program for shoes over a certain price threshold. eBay's fees are competitive, and their massive user base provides good exposure.</li>
        <li>Consignment shops like Bridge City Soles offer a different model entirely. You bring your pairs to the physical store, they display and sell them for you, and you receive your payout minus the consignment fee. The advantage is zero hassle with shipping, authentication, and customer service. The disadvantage is that your audience is limited to the store's local and online customer base.</li>
      </ul>

      <h2>The Economics of Reselling</h2>
      <p>Many aspiring resellers underestimate the costs involved. Platform fees, shipping costs, packaging materials, payment processing fees, and taxes all eat into margins. On a shoe with a fifty dollar markup over retail, you might only net twenty to thirty dollars after all costs. Scale is what makes reselling profitable for serious operators. Moving thirty pairs a month at twenty dollars profit each is six hundred dollars, which is decent side income but hardly a full-time salary. The resellers making serious money are operating at high volume, have access to consistent inventory at retail prices, and have diversified across multiple platforms and markets.</p>

      <h2>The Ethics Question</h2>
      <p>Reselling exists in a gray area that generates strong opinions. Critics argue that resellers buy up limited supply to profit from artificial scarcity, preventing genuine fans from getting shoes at retail. Defenders argue that reselling is simply market economics at work and that brands could solve the problem by producing more pairs or pricing closer to market value. The reality is somewhere in between. Brands benefit from the hype that limited supply generates, and the resale market has become a key driver of cultural relevance for sneaker brands. At Bridge City Soles, we believe in fair pricing and transparent grading, whether you are buying or consigning.</p>

      <h2>Tips for New Resellers</h2>
      <p>If you are thinking about getting into reselling, start small and learn the market before investing heavily. Focus on models and brands you actually know and understand. Track your costs meticulously, including every fee and shipping charge. Build a reputation for honesty and fast shipping, because reputation is everything in this business. And perhaps most importantly, never invest money you cannot afford to lose, because a release you expected to be heat can turn into a brick overnight based on factors entirely outside your control.</p>
    `,
  },
  {
    slug: 'sneaker-sizing-guide-perfect-fit',
    title: 'Sneaker Sizing Guide: How to Get the Perfect Fit Every Time',
    excerpt:
      'True to size, half size up, wide foot considerations, and brand-specific sizing tips to help you nail the fit on every purchase.',
    category: 'guides',
    tags: ['sizing', 'fit', 'buying tips', 'comfort'],
    readTime: '8 min read',
    image: u('photo-1662569147750-ef722928ce08'),
    date: '2026-02-10',
    content: `
      <h2>Why Sizing Is So Complicated</h2>
      <p>If sneaker sizing were consistent, this article would not need to exist. Unfortunately, a size 10 in one brand, model, or even colorway can feel completely different from a size 10 in another. Differences in last shape (the foot-shaped form around which shoes are built), material stretch, cushioning thickness, and design intent all affect how a shoe fits. Add in the complexity of buying online or from the resale market where returns may not be possible, and getting the right size becomes a genuinely important skill. This guide breaks down everything you need to know about sneaker sizing, from general principles to brand-specific advice.</p>

      <h2>Understanding True to Size</h2>
      <p>When someone says a shoe runs <a href="/glossary/true-to-size-tts" class="text-bcs-rust hover:text-bcs-rust2 underline">true to size (TTS)</a>, they mean it fits as expected based on your standard measured foot size. If you are a size 10 on a Brannock device (the metal measuring tool at shoe stores), a TTS shoe in size 10 should fit you well. However, "true to size" is somewhat subjective because everyone's feet are different and people have different preferences for how snug or loose they want their shoes. When reviewing sizing advice online, keep in mind that the person giving the recommendation may have wider or narrower feet than you, which skews their perception of TTS.</p>

      <h2>When to Go Half Size Up</h2>
      <p>Going <a href="/glossary/half-size-up" class="text-bcs-rust hover:text-bcs-rust2 underline">half size up</a> is the most common sizing adjustment in the sneaker world. You should consider sizing up a half size when a shoe is known to run small or narrow, when you have wider feet, when you prefer a slightly roomier fit for all-day comfort, or when the shoe uses materials that do not stretch much like patent leather or thick canvas. Models that commonly require a half size up include the Air Jordan 1 (runs slightly narrow), Yeezy 350 v2 (the Primeknit upper is snug, especially in the toe box), and Nike Dunk (the toe box is notoriously tight on some releases).</p>

      <h2>When to Go Half Size Down</h2>
      <p>Going <a href="/glossary/half-size-down" class="text-bcs-rust hover:text-bcs-rust2 underline">half size down</a> is less common but appropriate for shoes that run large or when the design is intentionally roomy. New Balance 990 series shoes run slightly large for many people, especially those with narrow feet. Adidas Ultra Boost can feel spacious in the Primeknit upper, leading some to size down. If you are between sizes and a shoe is known to stretch with wear, going half size down can give you a better long-term fit as the materials conform to your foot shape.</p>

      <h2>Wide Foot Considerations</h2>
      <p>If you have a <a href="/glossary/wide-foot" class="text-bcs-rust hover:text-bcs-rust2 underline">wide foot</a>, sizing becomes even more nuanced. Simply going up a full size to compensate for width often results in a shoe that is too long, causing heel slippage and instability. Instead, look for models that are known to accommodate wider feet. New Balance is legendary for offering wide (2E) and extra-wide (4E) options across most of their lineup. Nike's Air Force 1 and Dunk High tend to be more accommodating than the Dunk Low. Adidas shoes generally run wider than Nike through the midfoot. If a shoe has a <a href="/glossary/narrow" class="text-bcs-rust hover:text-bcs-rust2 underline">narrow</a> reputation, it is usually better to avoid it entirely rather than trying to size up around the problem.</p>

      <h2>GS, PS, and TD Sizing Explained</h2>
      <p><a href="/glossary/gs-grade-school" class="text-bcs-rust hover:text-bcs-rust2 underline">Grade School (GS)</a> sizing covers youth sizes 3.5Y to 7Y, which overlap with women's sizing. A GS 7Y is equivalent to a women's 8.5 and a men's 7. Many women buy GS sizes to save money on retro Jordans and other models, but be aware that GS shoes often use different materials and have slimmer proportions than their adult counterparts. The cushioning setup may also differ, with GS models sometimes lacking the Air or Zoom units found in adult sizes.</p>
      <p><a href="/glossary/ps-preschool" class="text-bcs-rust hover:text-bcs-rust2 underline">PS (Preschool)</a> covers sizes 10.5C to 3Y, and <a href="/glossary/td-toddler" class="text-bcs-rust hover:text-bcs-rust2 underline">TD (Toddler)</a> covers sizes 2C to 10C. These are children's sizes with simplified construction, often featuring Velcro straps instead of laces and different sole units than the adult versions. If you are buying for kids, know that children's feet grow rapidly, so buying a half size up to allow for growth is standard practice.</p>

      <h2>Brand-Specific Sizing Guide</h2>
      <p>Here is a general sizing guide based on common community consensus. Remember that individual models within each brand can vary, so always check model-specific advice when possible:</p>
      <ul>
        <li><a href="/glossary/nike" class="text-bcs-rust hover:text-bcs-rust2 underline">Nike</a>: Generally runs slightly narrow. Most people go TTS or half size up. Air Jordan 1s and Dunks are the most common half-size-up recommendations. Air Force 1s run large, so many go half size down or even a full size down.</li>
        <li><a href="/glossary/adidas" class="text-bcs-rust hover:text-bcs-rust2 underline">Adidas</a>: Runs slightly wider than Nike through the midfoot. Most Adidas shoes fit TTS. Yeezy 350s are the exception and run small, requiring a half size up for most people. Ultra Boost fits TTS to slightly large.</li>
        <li><a href="/glossary/new-balance" class="text-bcs-rust hover:text-bcs-rust2 underline">New Balance</a>: Known for generous fits and wide options. Most NB models fit TTS to slightly large. The 990 series, 550, and 2002R all fit TTS with a comfortable amount of room. New Balance is the best major brand for wide-footed sneakerheads.</li>
        <li><a href="/glossary/asics" class="text-bcs-rust hover:text-bcs-rust2 underline">Asics</a>: Generally TTS with a slightly narrow toe box on some models. The Gel-Lyte III can be snug for wider feet.</li>
        <li><a href="/glossary/converse" class="text-bcs-rust hover:text-bcs-rust2 underline">Converse</a>: Runs large. Most people go a full size down from their Nike size in Chuck Taylors.</li>
        <li><a href="/glossary/vans" class="text-bcs-rust hover:text-bcs-rust2 underline">Vans</a>: Generally TTS, though some people find them slightly narrow in the toe box. Similar sizing to Converse but more consistent across the lineup.</li>
      </ul>

      <h2>Unisex and Extended Sizing</h2>
      <p><a href="/glossary/unisex" class="text-bcs-rust hover:text-bcs-rust2 underline">Unisex</a> sizing is becoming more common as brands move toward inclusive approaches. The standard conversion is men's to women's minus 1.5 (a men's 9 is a women's 10.5). <a href="/glossary/extended-sizing" class="text-bcs-rust hover:text-bcs-rust2 underline">Extended sizing</a> refers to offerings beyond the standard men's 7-13 range, including small men's sizes that overlap with women's and GS, and larger sizes up to 15, 16, or even 18 for certain models. If you wear an extended size, your options on the resale market are more limited, which can work both for and against you: fewer pairs available, but also fewer buyers competing.</p>

      <h2>Pro Tips for Getting the Right Size</h2>
      <ul>
        <li>Measure your feet on a Brannock device at least once a year. Feet change over time due to age, weight, and activity level.</li>
        <li>Measure at the end of the day when your feet are at their largest from natural swelling.</li>
        <li>Always check community sizing threads on Reddit's r/Sneakers or review comments before buying a model for the first time.</li>
        <li>When buying from the resale market, clarify the return policy before purchasing. Some platforms offer no returns on used pairs.</li>
        <li>If you are between sizes, the general rule is to go up rather than down. A slightly roomy shoe can be fixed with thicker socks or an insole, but a too-tight shoe is just uncomfortable.</li>
      </ul>
      <p>At Bridge City Soles, our staff can help you figure out sizing on any model in our inventory. Stop by the shop and we will make sure you walk out with the right fit.</p>
    `,
  },
  {
    slug: 'building-your-sneaker-rotation',
    title: 'Building Your Sneaker Rotation: Quality Over Quantity',
    excerpt:
      'A well-curated rotation beats a closet full of impulse buys. Here is how to build a collection that works for your life and your style.',
    category: 'culture',
    tags: ['collection', 'rotation', 'lifestyle', 'style'],
    readTime: '8 min read',
    image: u('photo-1603631540004-d7b2616b2323'),
    date: '2026-01-28',
    content: `
      <h2>What Is a Sneaker Rotation?</h2>
      <p>A <a href="/glossary/rotation" class="text-bcs-rust hover:text-bcs-rust2 underline">rotation</a> is the set of sneakers you actively wear on a regular basis. Unlike a collection, which might include display pieces and deadstock investments, a rotation is your working lineup of <a href="/glossary/kicks" class="text-bcs-rust hover:text-bcs-rust2 underline">kicks</a> that you cycle through day to day. A good rotation serves every situation in your life, from work to weekends to weather, while keeping each pair fresh by distributing wear evenly across the lineup. Think of it like a wardrobe capsule for your feet: intentional, versatile, and built around your actual lifestyle rather than hype or impulse.</p>

      <h2>Why Rotation Matters</h2>
      <p>Wearing the same pair of sneakers every day is the fastest way to destroy them. Foam cushioning needs time to decompress between wears. Moisture from sweat needs time to evaporate. Materials need rest to maintain their shape. A rotation of five to seven pairs, worn one at a time and given at least a day of rest between wears, will last significantly longer than the same five pairs worn consecutively until each is worn out. Beyond preservation, rotating your sneakers keeps your style fresh and gives you the daily satisfaction of choosing which pair matches your outfit and mood.</p>

      <h2>The Three Categories: Beaters, Daily Drivers, and Grails</h2>
      <p>Every rotation needs a balance of three categories. <a href="/glossary/beaters" class="text-bcs-rust hover:text-bcs-rust2 underline">Beaters</a> are the shoes you wear without worrying about condition. Rain, mud, long walks, yard work, whatever life throws at you, your beaters absorb the punishment so your nicer pairs do not have to. These might be an older pair of Air Force 1s, some well-worn Vans, or last year's running shoes. The freedom of not caring about every scuff is genuinely liberating.</p>
      <p>Daily drivers are the core of your rotation: reliable, comfortable, versatile shoes that look good with most of your wardrobe. These are the pairs you reach for most often. Think clean New Balance 550s, Adidas Sambas, Air Jordan 1 Lows, or Nike Dunk Lows in neutral colorways. You care about keeping them presentable but you are not afraid to actually wear them.</p>
      <p>Then there are your <a href="/glossary/grail" class="text-bcs-rust hover:text-bcs-rust2 underline">grails</a>, the special occasion shoes. The pair that makes people stop and ask what you are wearing. The <a href="/glossary/heat" class="text-bcs-rust hover:text-bcs-rust2 underline">heat</a> that you save for occasions worth remembering. These are the shoes that bring you the most joy to wear precisely because you do not wear them every day. Maybe it is a prized collaboration, a vintage retro in your favorite colorway, or a pair you hunted for months to find in your size.</p>

      <h2>Building a Balanced Rotation</h2>
      <p>A solid starting rotation might look something like this:</p>
      <ul>
        <li>Two pairs of beaters for rough conditions and casual days</li>
        <li>Three to four daily drivers covering different styles (one runner, one lifestyle, one low-top, one mid or high)</li>
        <li>One to two pairs of heat for special occasions and statement fits</li>
        <li>One seasonal pair (boots for winter, sandals for summer, waterproof for rainy season)</li>
      </ul>
      <p>This eight to nine pair rotation covers virtually every situation while being manageable enough to actually use every pair regularly. You can scale up or down based on your lifestyle, budget, and closet space, but the principle of balance remains the same. A rotation of fifteen grails you are afraid to wear is less useful than a rotation of seven versatile pairs you actually put on your feet.</p>

      <h2>The Art of the Flex</h2>
      <p>Part of the joy of having a well-built rotation is the <a href="/glossary/flex" class="text-bcs-rust hover:text-bcs-rust2 underline">flex</a>, that moment when your shoes elevate an outfit and draw positive attention. But flexing is an art, not a competition. The best-dressed sneakerheads know that <a href="/glossary/drip" class="text-bcs-rust hover:text-bcs-rust2 underline">drip</a> comes from how a shoe fits into an overall look, not from how expensive or rare it is. A clean pair of white Air Force 1s styled perfectly with the right outfit can look better than a thousand-dollar grail paired with the wrong clothes. Build your rotation around shoes you genuinely love and know how to style, and the flex will take care of itself.</p>

      <h2>Storage and Maintenance for Your Rotation</h2>
      <p>Your rotation only stays strong if you take care of it. Here are the essentials:</p>
      <ul>
        <li>Use shoe trees or stuffing in your daily drivers after each wear to maintain shape and absorb moisture.</li>
        <li>Clean your shoes regularly, not just when they look dirty. A quick wipe-down after each wear prevents buildup.</li>
        <li>Store beaters and daily drivers in an accessible spot where you will actually grab them. If you have to dig through a closet, you will default to the same pair every day.</li>
        <li>Keep your grails and heat in a proper <a href="/glossary/shelf-display" class="text-bcs-rust hover:text-bcs-rust2 underline">shelf display</a> or clear drop-front boxes where they stay protected but visible. Seeing your collection daily is part of the enjoyment.</li>
        <li>Apply protector spray to suede and nubuck pairs before wearing.</li>
        <li>Rotate your insoles periodically and replace them when they flatten out, because fresh insoles can make an old pair feel new again.</li>
      </ul>

      <h2>Common Rotation Mistakes</h2>
      <p>The biggest mistake collectors make is buying shoes they never wear. If a pair has been sitting unworn for six months and it is not a deliberate investment piece, consider selling it and putting the money toward something you will actually use. Another common mistake is having a rotation full of similar shoes, like five pairs of black sneakers, that all serve the same purpose. Diversify your rotation across colors, silhouettes, and formality levels to maximize versatility. Finally, do not let hype dictate your rotation. Buy what you like, not what the internet tells you to like.</p>

      <h2>Quality Over Quantity: The Bottom Line</h2>
      <p>The sneaker community sometimes celebrates volume, showcasing massive collections that fill entire rooms. And there is nothing wrong with collecting broadly if that brings you joy. But for most people, a thoughtfully curated rotation of eight to twelve pairs that you love, wear regularly, and maintain properly will bring more daily satisfaction than a hundred pairs gathering dust in boxes. At Bridge City Soles, we help customers build rotations that match their lifestyle, whether that means finding the perfect beater for Portland rain or tracking down a grail they have wanted for years. Quality over quantity, always.</p>
    `,
  },
  {
    slug: 'history-of-nike-sb',
    title: 'The History of Nike SB: From Skate Parks to Hype Culture',
    excerpt:
      'How Nike conquered the skate world, survived early resistance, and turned the SB Dunk into one of the most coveted sneakers of the modern era.',
    category: 'history',
    tags: ['nike sb', 'dunk', 'skateboarding', 'history', 'culture'],
    readTime: '9 min read',
    image: u('photo-1623684225794-a8f1f5037f5c'),
    date: '2026-01-15',
    content: `
      <h2>A Rocky Beginning</h2>
      <p><a href="/glossary/nike" class="text-bcs-rust hover:text-bcs-rust2 underline">Nike</a> has been the world's dominant sneaker brand for decades, but when it came to skateboarding, the company faced something it rarely encountered: genuine resistance from its target audience. In the early 2000s, skate culture was fiercely independent and deeply skeptical of corporate brands. Skaters wore shoes from brands built by and for skaters like Etnies, DVS, eS, and DC. Nike was seen as a mainstream interloper trying to buy its way into a subculture it did not understand. The company had tried once before in the late 1990s with a skate team and skate-specific shoes, but the effort was poorly received and quietly shelved. When Nike SB launched as a dedicated skateboarding division in 2002, it needed to earn credibility the hard way.</p>

      <h2>Sandy Bodecker's Vision</h2>
      <p>The creation of Nike SB was driven primarily by Sandy Bodecker, a longtime Nike executive who was himself passionate about skateboarding. Bodecker understood that Nike could not simply slap a swoosh on a skate shoe and expect the community to embrace it. His approach was to build Nike SB as a semi-autonomous unit within the company, staffed by people who genuinely skated and understood the culture. The initial Nike SB team featured respected pro skaters like Gino Iannucci, Reese Forbes, and Richard Mulder, lending credibility that no marketing budget alone could buy.</p>

      <h2>The SB Dunk: A Skater's Shoe</h2>
      <p>The foundational decision was adapting the <a href="/glossary/dunk" class="text-bcs-rust hover:text-bcs-rust2 underline">Dunk</a> silhouette for skateboarding. The original 1985 Dunk was a basketball shoe, but its low-profile design and flat sole made it a natural candidate for skating. Nike SB modified the Dunk with a Zoom Air insole for impact protection, a padded tongue and collar for ankle support, and a tackier outsole rubber compound for better board grip. The result was a shoe that actually performed on a skateboard, not just a fashion piece with a skate label. Early SB Dunks were distributed exclusively through a network of core skate shops, which helped maintain the brand's underground credibility.</p>

      <h2>The Pigeon Dunk: The Moment Everything Changed</h2>
      <p>On February 22, 2005, Jeff Staple's Pigeon Dunk SB caused a near-riot outside his Reed Space shop in New York City. Only 150 pairs were produced, and the crowd that gathered to buy them was so large and aggressive that the NYPD had to intervene. The incident made the front page of the New York Post and landed on national news programs. It was a pivotal moment not just for Nike SB but for sneaker culture as a whole. The Pigeon Dunk proved that sneakers could generate the same level of frenzy as concert tickets or tech product launches. It was the moment the mainstream world realized that sneakers were serious cultural objects, not just shoes.</p>

      <h2>The Golden Era: 2003 to 2008</h2>
      <p>The mid-2000s were the golden era of Nike SB. Every month seemed to bring another instant classic. The "Tiffany" Dunk by Diamond Supply Co. with its Tiffany blue colorway and crocodile-embossed swoosh. The "What the Dunk" that combined elements from thirty-one previous SB releases into a single absurd shoe. The Supreme Dunks that helped cement Supreme's status as a cultural powerhouse. The "Paris" Dunk, limited to just 202 pairs, which featured a painting by Bernard Buffet and remains one of the most valuable sneakers ever made. During this period, every <a href="/glossary/quickstrike" class="text-bcs-rust hover:text-bcs-rust2 underline">Quickstrike</a> release was an event, and the SB Dunk box colors became a collector's classification system: orange box, silver box, gold box, pink box, each signifying a different era and rarity level.</p>

      <h2>The Lobster Series and Concept Collabs</h2>
      <p>Concepts, the Boston and New York-based boutique, created one of the most beloved series in SB Dunk history with their Lobster Dunks. Starting with the Red Lobster in 2008, followed by Blue, Green, Yellow, and Purple Lobster editions over the following decade, the series demonstrated that a <a href="/glossary/collab" class="text-bcs-rust hover:text-bcs-rust2 underline">collab</a> could be an ongoing storytelling project rather than a one-off product. Each colorway referenced a different rarity of lobster found in New England waters, with the special packaging including a rubber band lace accessory mimicking the bands placed on a lobster's claws. The Lobster series became a <a href="/glossary/grail" class="text-bcs-rust hover:text-bcs-rust2 underline">grail</a> set for SB collectors, and the cultural connection between the <a href="/glossary/x-collaboration" class="text-bcs-rust hover:text-bcs-rust2 underline">collaborative</a> shoe and a specific regional identity set a template that many later collabs would follow.</p>

      <h2>The Quiet Years and the Resurgence</h2>
      <p>After the initial SB Dunk boom, interest cooled through the early 2010s as sneaker culture shifted toward other silhouettes like the Yeezy and Ultra Boost. Nike SB continued releasing quality shoes, but the frenzy subsided. Then, around 2019 and 2020, the SB Dunk came roaring back. Travis Scott wore SB Dunks publicly. The Ben and Jerry's "Chunky Dunky" collab became one of the most hyped releases of 2020. The Grateful Dead Dunks with their fuzzy bear uppers went viral. Suddenly, SB Dunks were commanding resale prices that rivaled their mid-2000s peak, and a new generation of <a href="/glossary/sneakerhead" class="text-bcs-rust hover:text-bcs-rust2 underline">sneakerheads</a> discovered the silhouette for the first time.</p>

      <h2>Special Boxes and the Tier System</h2>
      <p>One of the unique aspects of Nike SB culture is the significance of the shoebox itself. Different box colors correspond to different eras and distribution tiers. The orange box era (2002-2006) is considered the golden age. Silver, gold, and pink boxes followed. Limited releases came in special packaging like the Tiffany blue box for the Diamond Dunk or the custom "What the Dunk" box. For SB collectors, the box is part of the package, and a pair missing its original special box is significantly less valuable than one with it. This attention to packaging detail is part of what makes SB culture distinct from the broader Nike universe.</p>

      <h2>The Legacy and Future of Nike SB</h2>
      <p>Nike SB's journey from unwanted outsider to cultural institution is one of the great stories in sneaker history. The brand earned its place in skateboarding by respecting the culture, hiring authentic voices, and creating genuinely great products. Along the way, it produced some of the most collectible and culturally significant sneakers ever made. The SB Dunk, in particular, has become a canvas for creative expression that has attracted artists, designers, boutiques, and celebrities from around the world. At Bridge City Soles in Portland, Nike SB Dunks are consistently among our most sought-after inventory, with both longtime collectors hunting vintage <a href="/glossary/heat" class="text-bcs-rust hover:text-bcs-rust2 underline">heat</a> and newer <a href="/glossary/hypebeast" class="text-bcs-rust hover:text-bcs-rust2 underline">hypebeast</a> buyers chasing the latest drops. The SB Dunk is proof that when a brand genuinely commits to a subculture, the results can be extraordinary.</p>
      <p>Whether you are a skater who appreciates the performance, a collector who values the history, or a style-focused buyer who loves the design versatility, the Nike SB catalog has something for you. Stop by Bridge City Soles to browse our current SB inventory or ask our staff about the stories behind the shoes.</p>
    `,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
