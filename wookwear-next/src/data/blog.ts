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

export const BLOG_CATEGORIES = [
  'all',
  'techniques',
  'materials',
  'culture',
  'behind-the-scenes',
  'guides',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  techniques: 'Techniques',
  materials: 'Materials',
  culture: 'Culture',
  'behind-the-scenes': 'Behind the Scenes',
  guides: 'Guides',
};

export const posts: BlogPost[] = [
  /* -------------------------------------------------------
     TECHNIQUES
     ------------------------------------------------------- */
  {
    slug: 'hand-sewing-vs-machine-sewing',
    title: 'Hand Sewing vs. Machine Sewing: When to Use Each',
    excerpt: 'Both hand sewing and machine sewing have a place in every maker\'s toolkit. Learn when to reach for a needle and when to fire up the machine.',
    date: '2026-03-20',
    category: 'techniques',
    tags: ['sewing', 'handmade', 'machine'],
    readTime: '5 min read',
    image: '/images/pink-checker-1.jpg',
    content: '<p>If you\'ve ever watched a maker work, you\'ve probably noticed they switch between hand stitching and machine sewing without a second thought. That back-and-forth isn\'t random. Each method shines in different situations, and knowing when to use which one is what separates a wobbly first project from something you\'re genuinely proud of.</p>' +
      '<h2>When Hand Sewing Wins</h2>' +
      '<p>Hand sewing is all about control. When you\'re attaching a snap closure to a pouch, finishing a rolled edge, or adding decorative sashiko stitching, there\'s simply no substitute for the precision of a needle in your hand. You can feel the fabric, adjust your tension stitch by stitch, and work around curves and corners that would jam most home machines.</p>' +
      '<p>Decorative techniques like blanket stitch binding, embroidery, and applique are almost always done by hand. The slight irregularity of hand stitches is part of their charm. Every Wook Wear piece has at least some hand-sewn elements because those details are what make each one truly one-of-a-kind.</p>' +
      '<h2>When the Machine Takes Over</h2>' +
      '<p>For structural seams that need to hold up to daily wear, the sewing machine is your best friend. A machine lockstitch is stronger and more consistent than most hand stitches, and it\'s dramatically faster. When you\'re sewing the main body seams of a crossbody bag or topstitching through multiple layers of waxed canvas, the machine delivers the power and speed you need.</p>' +
      '<p>Bar tacks, which are those dense clusters of stitches at stress points like strap attachments, are another place where the machine excels. A good bar tack can hold hundreds of pounds of force, which matters when someone is dancing through a festival crowd with your bag bouncing on their hip.</p>' +
      '<h2>The Sweet Spot: Using Both</h2>' +
      '<p>Most handmade bags and pouches use a combination of both methods. The workflow usually goes like this: cut and prep by hand, sew the structural seams on the machine, then finish edges, attach hardware, and add decorative touches by hand. This hybrid approach gives you the durability of machine sewing with the artistry of hand stitching.</p>' +
      '<p>If you\'re just starting out, don\'t feel pressured to buy an expensive machine right away. A simple needle, quality thread, and a thimble can get you surprisingly far. Once you\'ve built a few pieces by hand and understand how seams work, the machine will make a lot more sense when you\'re ready for it.</p>',
  },
  {
    slug: 'what-is-sashiko-stitching',
    title: 'What Is Sashiko? The Ancient Art of Japanese Decorative Stitching',
    excerpt: 'Sashiko is a centuries-old Japanese stitching technique that turns simple running stitches into stunning geometric patterns. Here\'s how it works.',
    date: '2026-03-17',
    category: 'techniques',
    tags: ['sashiko', 'japanese', 'decorative', 'stitching'],
    readTime: '6 min read',
    image: '/images/denim-crossbody-1.jpg',
    content: '<p>Sashiko, which literally translates to "little stabs," is a form of Japanese decorative stitching that dates back to the Edo period. What started as a practical way for working-class families to mend and reinforce worn clothing has evolved into one of the most beautiful and meditative needlework traditions in the world.</p>' +
      '<h2>The History Behind the Stitch</h2>' +
      '<p>Japanese farmers and fishermen originally used sashiko to reinforce areas of their indigo-dyed work clothes that wore out quickly, like elbows and knees. By layering scraps of fabric and stitching them together in dense geometric patterns, they created textiles that were stronger than the originals. The patterns weren\'t just decorative. Each one served a structural purpose, distributing stress across the fabric evenly.</p>' +
      '<p>Over the centuries, the patterns became more elaborate and took on symbolic meanings. The asanoha (hemp leaf) pattern was believed to promote healthy growth and was often used on baby clothes. The nowaki (ocean waves) pattern represented resilience. These motifs were passed down through generations, each family developing their own variations.</p>' +
      '<h2>How Sashiko Works</h2>' +
      '<p>At its core, sashiko is a running stitch, which is the simplest stitch in sewing. What makes it special is the rhythm and precision. Traditional sashiko uses white cotton thread on indigo fabric, creating a striking contrast. The stitches are typically longer on the top surface than on the back, usually in a ratio of about three to two. This creates the characteristic dashed line appearance.</p>' +
      '<p>The key to good sashiko is consistency. Each stitch should be roughly the same length, and the spacing between stitches should be even. Many stitchers use a special long sashiko needle that can load multiple stitches at once, weaving through the fabric before pulling the thread through. It\'s rhythmic, almost musical once you find your flow.</p>' +
      '<h2>Sashiko at Wook Wear</h2>' +
      '<p>At Wook Wear, sashiko stitching shows up most often on our denim crossbody bags. The combination of heavy denim with white or contrasting thread creates that classic indigo-and-white look while adding an extra layer of structural reinforcement right where the bag needs it most. Each panel gets its own pattern, so no two bags are ever identical.</p>' +
      '<p>If you want to try sashiko yourself, all you need is a needle, some sashiko thread or embroidery floss, and a piece of fabric. Draw a simple grid with a washable marker and start stitching. The beauty of sashiko is that imperfections add character. It\'s one of the most forgiving and rewarding techniques for beginners and experienced stitchers alike.</p>',
  },
  {
    slug: 'blanket-stitch-binding-tutorial',
    title: 'Blanket Stitch Binding: How to Finish Edges Like a Pro',
    excerpt: 'The blanket stitch is the ultimate edge finish for handmade goods. Learn the technique that gives every Wook Wear piece its signature clean edge.',
    date: '2026-03-14',
    category: 'techniques',
    tags: ['blanket-stitch', 'binding', 'edges', 'finishing'],
    readTime: '5 min read',
    image: '/images/display-mats-1.jpg',
    content: '<p>If you\'ve ever picked up a handmade pouch or display mat and admired the neat, looping stitches along the edge, chances are you were looking at a blanket stitch. This simple but elegant technique is one of the most versatile finishing methods in any maker\'s repertoire, and it\'s a cornerstone of the Wook Wear aesthetic.</p>' +
      '<h2>What Is a Blanket Stitch?</h2>' +
      '<p>The blanket stitch is a hand-sewing technique that wraps thread around the raw edge of fabric, creating a series of evenly spaced loops that both secure the edge and look beautiful. It gets its name from its traditional use on wool blankets, where it prevented the cut edges from unraveling. Unlike a simple whip stitch, the blanket stitch creates a perpendicular bar along the edge that locks each loop in place.</p>' +
      '<h2>Step by Step</h2>' +
      '<p>Start by threading your needle with about an arm\'s length of thread. Anchor your first stitch by coming up through the fabric about a quarter inch from the edge. Now here\'s the key move: insert the needle from front to back, a quarter inch to the right and right at the edge. Before you pull the thread through, loop it under the needle tip. When you pull tight, you\'ll see the characteristic L-shaped stitch form along the edge.</p>' +
      '<p>Repeat this process, keeping your stitches evenly spaced. Consistency is everything. Try to maintain the same distance from the edge and the same spacing between stitches throughout. Most makers aim for stitches about three-sixteenths to a quarter inch apart, but you can adjust this based on your thread weight and the look you\'re going for.</p>' +
      '<h2>Why It Matters for Pouches and Mats</h2>' +
      '<p>On display mats and pouches, the blanket stitch does double duty. First, it physically binds the layers together and prevents fraying. This is especially important on display mats that get rolled and unrolled constantly at festivals and markets. Second, the visible stitching becomes a design element. By using contrasting thread colors, you can turn a functional edge finish into a bold visual statement.</p>' +
      '<p>At Wook Wear, blanket stitch binding often appears in colors that pop against the main fabric. Think neon thread on dark denim, or rainbow-variegated thread on a checkerboard pouch. The stitch pattern creates a rhythmic visual texture that frames the piece like a border around a painting.</p>' +
      '<h2>Tips for Beginners</h2>' +
      '<p>Use a thimble. Seriously. Pushing a needle through multiple layers of canvas or denim hundreds of times will shred your fingertip without one. Also, don\'t cut your thread too long. Anything over eighteen inches tends to tangle and knot. It\'s faster to re-thread a few times than to untangle a mess halfway through your edge.</p>',
  },
  {
    slug: 'patchwork-basics-for-beginners',
    title: 'Patchwork 101: Combining Fabrics Into Something Beautiful',
    excerpt: 'Patchwork turns scraps into stunning one-of-a-kind pieces. Learn the basics of cutting, piecing, and building fabric compositions.',
    date: '2026-03-11',
    category: 'techniques',
    tags: ['patchwork', 'quilting', 'fabric', 'beginners'],
    readTime: '5 min read',
    image: '/images/backpack-1.jpg',
    content: '<p>Patchwork is one of the oldest and most satisfying textile arts. At its heart, it\'s simple: take pieces of different fabrics, sew them together, and create something entirely new. But within that simplicity lies an enormous range of creative possibilities, from traditional quilt blocks to the wild, improvisational compositions that define Wook Wear\'s look.</p>' +
      '<h2>Choosing Your Fabrics</h2>' +
      '<p>The first rule of patchwork is that contrast is your friend. Mixing light and dark fabrics, combining different textures, and playing with scale in your prints creates visual energy. A piece made entirely from similar fabrics will look flat, no matter how perfectly it\'s sewn. But throw a chunky corduroy next to a smooth cotton print and suddenly things get interesting.</p>' +
      '<p>When selecting fabrics, pay attention to weight. Mixing a heavy denim with a lightweight cotton can work, but you\'ll need to interface the lighter fabric to prevent puckering. For bags and pouches, medium to heavyweight fabrics like canvas, denim, and corduroy are ideal because they hold their shape and stand up to daily use.</p>' +
      '<h2>Cutting and Piecing</h2>' +
      '<p>Accurate cutting is the foundation of good patchwork. A rotary cutter, self-healing cutting mat, and clear acrylic ruler are the holy trinity of patchwork tools. Mark your seam allowance clearly, usually a quarter inch for patchwork, and cut precisely. If your pieces are off by even a sixteenth of an inch, those errors compound across multiple seams and your final piece won\'t lie flat.</p>' +
      '<p>Piece your fabrics together with a consistent quarter inch seam. Press your seams to one side rather than open for stronger joins. When connecting rows, nest your seams so the bulk on one row faces the opposite direction from the next. This reduces thickness at the intersections and helps everything line up cleanly.</p>' +
      '<h2>Going Improvisational</h2>' +
      '<p>Traditional patchwork follows precise patterns and templates. Improvisational patchwork throws the templates away. You cut freehand, piece intuitively, and let the fabric tell you where it wants to go. This is the approach that drives much of Wook Wear\'s aesthetic. No two pieces are planned the same way because no two collections of scraps are the same.</p>' +
      '<p>Improv patchwork is incredibly freeing, but it does take practice. Start by sewing two scraps together, trimming the result into a new shape, and adding more. Build outward from a center point, rotating and flipping as you go. Don\'t overthink it. Some of the most striking compositions come from happy accidents.</p>' +
      '<h2>From Scraps to Art</h2>' +
      '<p>The beauty of patchwork is that nothing goes to waste. Every scrap, every offcut, every remnant from a previous project becomes raw material for the next one. In a world of mass production and disposable fashion, there\'s something deeply satisfying about turning a pile of fabric scraps into a bag or pouch that will last for years.</p>',
  },

  /* -------------------------------------------------------
     MATERIALS
     ------------------------------------------------------- */
  {
    slug: 'guide-to-waxed-canvas',
    title: 'Waxed Canvas: The Toughest Fabric You\'ll Ever Love',
    excerpt: 'Waxed canvas is rugged, water-resistant, and develops a gorgeous patina over time. Here\'s why makers and adventurers swear by it.',
    date: '2026-03-08',
    category: 'materials',
    tags: ['waxed-canvas', 'fabric', 'durability', 'bags'],
    readTime: '5 min read',
    image: '/images/denim-crossbody-2.jpg',
    content: '<p>Waxed canvas has been around for centuries, and for good reason. Originally developed by Scottish sailors who discovered that oiling their sails made them more water-resistant, the technique eventually moved onshore and into everyday gear. Today, waxed canvas is a favorite material among bag makers, outdoor enthusiasts, and anyone who appreciates a fabric that gets better with age.</p>' +
      '<h2>What Makes It Special</h2>' +
      '<p>Waxed canvas starts as regular cotton canvas that\'s been treated with a wax-based coating, typically a blend of paraffin and beeswax. This coating fills the gaps between the cotton fibers, creating a water-resistant barrier while keeping the fabric breathable. Unlike synthetic waterproof fabrics, waxed canvas has a soft, slightly tacky hand feel and develops a unique patina as it ages, with creases and wear marks that tell the story of its adventures.</p>' +
      '<p>The durability is remarkable. Heavy-duty waxed canvas, typically in the twelve to eighteen ounce range, can withstand years of daily abuse. It resists abrasion, repels light rain, and shrugs off dirt. The wax finish also makes it naturally resistant to mildew, which is a huge plus for bags that spend time outdoors.</p>' +
      '<h2>Working With Waxed Canvas</h2>' +
      '<p>Sewing waxed canvas requires a few adjustments to your normal workflow. You\'ll want a heavy-duty needle, usually a size sixteen or eighteen, and a walking foot or Teflon foot on your machine to prevent the waxy surface from sticking. Skip the pins and use clips instead since pin holes don\'t close up in waxed fabric. And forget about ironing. Heat melts the wax and ruins the finish.</p>' +
      '<p>Cutting is best done with a sharp rotary cutter on a self-healing mat. Mark your pattern pieces on the wrong side with chalk, never pen, as ink will bleed through the wax. When you sew, the needle will leave visible holes along the seam line, which is part of the rugged aesthetic. Embrace it.</p>' +
      '<h2>How to Care for Waxed Canvas</h2>' +
      '<p>Caring for waxed canvas is refreshingly simple. Brush off dirt with a stiff brush, wipe down stains with a damp cloth and mild soap, and let it air dry. Never machine wash or dry clean a waxed canvas bag because the agitation and chemicals strip the wax coating. Over time, high-wear areas will lose their wax and the fabric will lighten in color. When this happens, you can re-wax the entire piece with a bar of fabric wax and a hair dryer. It takes about twenty minutes and your bag will look brand new.</p>' +
      '<p>The patina that waxed canvas develops over time is genuinely beautiful. Each crease, scuff, and fade mark makes the piece more uniquely yours. It\'s one of those rare materials where aging is a feature, not a flaw.</p>',
  },
  {
    slug: 'types-of-fabric-for-handmade-bags',
    title: 'Fabric Guide: Choosing the Right Material for Handmade Bags',
    excerpt: 'Cotton canvas, denim, corduroy, sherpa, nylon. Each fabric brings different strengths. Here\'s how to choose the right one for your project.',
    date: '2026-03-05',
    category: 'materials',
    tags: ['fabric', 'canvas', 'denim', 'corduroy', 'bags'],
    readTime: '6 min read',
    image: '/images/backpack-3.jpg',
    content: '<p>Choosing the right fabric is the most important decision you\'ll make when designing a handmade bag. The material determines how the bag feels, how long it lasts, how it looks, and how easy it is to sew. After years of experimenting with dozens of fabrics, here\'s what you need to know about the most popular options.</p>' +
      '<h2>Cotton Canvas</h2>' +
      '<p>Cotton canvas is the workhorse of the bag-making world. It\'s durable, widely available, relatively affordable, and comes in an enormous range of weights, colors, and prints. For most bag projects, look for canvas in the eight to twelve ounce range. Lighter canvas works for linings and smaller pouches, while heavier weights are better for totes and backpacks. Canvas takes dye and printing beautifully, which is why it\'s a go-to for bold, colorful designs.</p>' +
      '<h2>Denim</h2>' +
      '<p>Denim is cotton canvas\'s tougher cousin. The twill weave gives it a distinctive diagonal texture and incredible strength. Denim bags have a casual, lived-in aesthetic that only gets better with time. The main challenge with denim is its weight. Twelve to fourteen ounce denim is perfect for bags, but sewing through multiple layers at seam intersections requires a sturdy machine and thick needles. Denim also frays beautifully, which you can use as a deliberate design element.</p>' +
      '<h2>Corduroy</h2>' +
      '<p>Corduroy brings texture and warmth to bag designs. The raised wales create a ribbed surface that feels cozy and looks distinctive. Wide-wale corduroy works best for bags because the ribs are sturdy enough to hold their shape. It\'s a fantastic choice for fall and winter pieces and pairs wonderfully with denim and canvas in patchwork compositions. The one downside is that corduroy can be a dust magnet, so it\'s better suited for pouches and smaller bags than everyday totes.</p>' +
      '<h2>Sherpa and Fleece</h2>' +
      '<p>Sherpa is the ultimate cozy fabric. With its curly, wool-like texture on one side and smooth knit backing on the other, it adds a plush, tactile element to any piece. At Wook Wear, sherpa shows up in buddy pouches and as accent panels. It\'s not structural enough to use as a primary bag fabric, but combined with a sturdier outer shell, it creates something that people can\'t stop touching. Fleece is similar but flatter and lighter, making it a good choice for linings.</p>' +
      '<h2>Nylon and Polyester</h2>' +
      '<p>When water resistance and ultra-light weight are priorities, synthetic fabrics step in. Ripstop nylon is incredibly strong for its weight and resists tearing even when punctured. Cordura nylon is heavier but nearly indestructible. Polyester is less expensive and holds printed designs well. The trade-off with synthetics is that they lack the warmth and character of natural fibers. They don\'t develop a patina, and they can feel plasticky. But for functional pieces that need to survive harsh conditions, they\'re hard to beat.</p>' +
      '<h2>Mixing Materials</h2>' +
      '<p>The real magic happens when you combine fabrics. A denim exterior with a sherpa-lined pocket, canvas straps on a corduroy body, or patchwork that mixes three or four different materials in one panel. The key is to be intentional about weight and stretch. Keep structural elements in stable, heavy fabrics and use lighter, stretchier materials for accents and linings. When different fabrics meet at a seam, use interfacing on the lighter one to match the weight of its neighbor.</p>',
  },
  {
    slug: 'what-is-sherpa-fabric',
    title: 'What Is Sherpa Fabric? The Cozy Textile Behind Our Buddy Pouches',
    excerpt: 'Sherpa fabric is soft, plush, and irresistibly cozy. Discover what makes this curly-textured textile perfect for handmade pouches.',
    date: '2026-03-02',
    category: 'materials',
    tags: ['sherpa', 'fleece', 'fabric', 'buddy-pouch'],
    readTime: '4 min read',
    image: '/images/orange-buddy.jpg',
    content: '<p>If you\'ve ever buried your hands in a Wook Wear buddy pouch and thought "this is unreasonably soft," you\'ve met sherpa fabric. Named after the Sherpa people of Nepal who are famous for thriving in extreme cold, sherpa fabric is designed to mimic the cozy texture of sheep\'s wool without using any animal products.</p>' +
      '<h2>Sherpa vs. Fleece: What\'s the Difference?</h2>' +
      '<p>Sherpa and fleece are often confused, but they have distinct characteristics. Fleece is soft and smooth on both sides with a uniform, flat pile. Sherpa has two very different faces: one side features bumpy, curly fibers that look like wool, while the other is a smooth, flat knit. This dual-sided construction gives sherpa more visual texture and a more luxurious hand feel compared to standard fleece.</p>' +
      '<p>Both are typically made from polyester, which means they\'re lightweight, quick-drying, and machine washable. Sherpa tends to be slightly heavier and thicker than fleece, giving it better insulating properties. The curly pile traps air between the fibers, creating a warm microclimate against the skin.</p>' +
      '<h2>Why Sherpa Works for Pouches</h2>' +
      '<p>Buddy pouches are meant to be touched, squeezed, and carried close to the body. The sensory experience matters as much as the visual design. Sherpa fabric provides that instant comfort factor. When someone picks up a sherpa-lined pouch, there\'s an involuntary reaction: they don\'t want to put it down. That tactile appeal is what turns a functional accessory into something people form an emotional attachment to.</p>' +
      '<p>From a construction standpoint, sherpa\'s thickness adds structure to small pouches without requiring interfacing. The fabric holds its shape when sewn into panels, and the curly pile hides minor stitching imperfections along seam lines. It\'s also forgiving to cut. Unlike slippery fabrics that shift on the cutting mat, sherpa stays put and cuts cleanly with a rotary cutter.</p>' +
      '<h2>Working With Sherpa</h2>' +
      '<p>The biggest challenge with sherpa is shedding. Those curly fibers love to escape during cutting and sewing, so keep a lint roller nearby and vacuum your workspace when you\'re done. Use a longer stitch length than you would with canvas or denim since a shorter stitch can bunch the pile and create a stiff, puckered seam.</p>' +
      '<p>When pressing seams, skip the iron entirely. Heat will melt polyester sherpa into a flat, shiny disaster. Instead, finger-press your seams open or use a seam roller. For attaching sherpa panels to heavier fabrics like denim or canvas, use a walking foot to prevent the layers from shifting. The pile can grab and drag under a standard presser foot, causing uneven seam lines.</p>' +
      '<p>Sherpa comes in a rainbow of colors and even prints, making it a perfect match for Wook Wear\'s psychedelic aesthetic. A neon orange sherpa panel on a tie-dye pouch? That\'s the kind of unexpected combination that stops people in their tracks at a festival.</p>',
  },
  {
    slug: 'understanding-fabric-weight-and-drape',
    title: 'Fabric Weight and Drape: Why It Matters for Every Stitch',
    excerpt: 'Understanding fabric weight and drape helps you choose the right textile for every project. Here\'s the practical guide you need.',
    date: '2026-02-27',
    category: 'materials',
    tags: ['fabric', 'weight', 'drape', 'GSM'],
    readTime: '5 min read',
    image: '/images/pouches-circle-1.jpg',
    content: '<p>Walk into any fabric store and you\'ll see bolts labeled with unfamiliar numbers: 4 oz, 10 oz, 200 GSM. Those numbers describe fabric weight, and understanding them is one of the most practical skills a maker can develop. Weight affects everything from how a bag holds its shape to how comfortable a strap feels on your shoulder.</p>' +
      '<h2>What Is GSM?</h2>' +
      '<p>GSM stands for grams per square meter, and it\'s the most universal way to measure fabric weight. A lightweight cotton might come in at 100 GSM, while heavy denim could weigh 400 GSM or more. In the United States, you\'ll also see fabric measured in ounces per square yard. The conversion is roughly: one ounce per square yard equals about 34 GSM. So a 10 oz canvas is approximately 340 GSM.</p>' +
      '<p>For bag making, you generally want fabrics in the 200 to 500 GSM range. Below 200 GSM, fabrics are too light for structural use unless you add interfacing. Above 500 GSM, you\'re into territory where most home sewing machines struggle to punch through multiple layers.</p>' +
      '<h2>Understanding Drape</h2>' +
      '<p>Drape describes how a fabric falls and moves when it hangs freely. A fabric with lots of drape flows and pools, like silk or rayon. A fabric with little drape holds its shape and stands up on its own, like heavy canvas or buckram. Drape is influenced by weight, fiber content, and weave structure.</p>' +
      '<p>For bags and pouches, you generally want low to medium drape. A tote bag needs enough stiffness to stay open when you set it down but enough flexibility to fold flat when it\'s empty. A pouch needs to hold its shape in your hand but conform to your pocket or the inside of a larger bag. Getting this balance right is largely about choosing the right fabric weight.</p>' +
      '<h2>Matching Weight to Function</h2>' +
      '<p>Different parts of a bag call for different weights. The exterior panels need to be heavy enough to hold shape and resist abrasion, typically 8 to 14 oz canvas or denim. Straps and handles should be sturdy but not so heavy that they\'re uncomfortable, usually the same weight as the body or slightly lighter with webbing reinforcement. Linings should be lighter, 4 to 6 oz, so they don\'t add unnecessary bulk.</p>' +
      '<p>When mixing weights in patchwork, use interfacing to bring lighter fabrics up to the weight of their heavier neighbors. Iron-on woven interfacing is the easiest option. It adds structure without changing the fabric\'s surface texture, and it prevents lighter panels from stretching or distorting relative to the heavier ones around them.</p>' +
      '<h2>The Feel Factor</h2>' +
      '<p>Numbers only tell part of the story. Two fabrics with the same GSM can feel completely different depending on their fiber content and weave. A 300 GSM sherpa feels soft and plush, while a 300 GSM canvas feels crisp and sturdy. Always handle fabric before buying if you can. Rub it between your fingers, drape it over your hand, and fold it to check for stiffness. The way a fabric feels in your hands is the best predictor of how it\'ll perform in your finished piece.</p>',
  },

  /* -------------------------------------------------------
     CULTURE
     ------------------------------------------------------- */
  {
    slug: 'history-of-festival-fashion',
    title: 'Festival Fashion Through the Decades: From Woodstock to Now',
    excerpt: 'Festival fashion has evolved from flower crowns and fringe to a full-blown creative culture. Trace the journey from Woodstock to the modern festival scene.',
    date: '2026-02-24',
    category: 'culture',
    tags: ['festival', 'fashion', 'culture', 'history'],
    readTime: '6 min read',
    image: '/images/buddy-mats-1.jpg',
    content: '<p>Festival fashion didn\'t start as fashion at all. It started as self-expression. When half a million people gathered on a dairy farm in Bethel, New York in 1969, nobody was thinking about outfit photos. They wore what felt free: cutoff denim, flowing maxi skirts, hand-embroidered vests, and bare feet. The look wasn\'t curated. It was genuine.</p>' +
      '<h2>The Seventies and Eighties</h2>' +
      '<p>Through the seventies, festival fashion leaned into handmade and natural materials. Macrame, leather, crochet, and tie-dye were everywhere. People made their own clothes or bought from local artisans. The aesthetic was earthy, tactile, and deeply personal. Each piece had a story because someone had actually made it with their hands.</p>' +
      '<p>The eighties brought punk and new wave influences to outdoor music events. DIY culture remained strong, but the materials changed. Studded leather, safety pins, hand-painted denim jackets, and screen-printed band tees became the uniform. Festival fashion was still about identity and community, just with a harder edge.</p>' +
      '<h2>The Rave Era</h2>' +
      '<p>The nineties and early 2000s rave scene transformed festival fashion completely. Bright colors, UV-reactive fabrics, wide-leg pants, platform shoes, and layers of kandi beads created a visual language that was all about joy, connection, and sensory experience. The PLUR ethos (peace, love, unity, respect) extended to what people wore and traded. Handmade kandi bracelets became the ultimate festival currency, exchanged through an elaborate handshake ritual.</p>' +
      '<h2>Modern Festival Culture</h2>' +
      '<p>Today\'s festival fashion is a remix of everything that came before. You\'ll see tie-dye next to techwear, crochet halter tops next to LED-embedded jackets, and vintage deadstock next to pieces by independent makers. The biggest shift is the emphasis on functionality. People aren\'t just wearing costumes anymore. They need pockets, they need crossbody bags that stay put in a crowd, they need pouches that keep their essentials secure while they dance.</p>' +
      '<p>This is where the wook aesthetic lives. "Wook" started as a somewhat playful term for the most dedicated festival-goers, the ones who live for the music and the community rather than the photo ops. Wook fashion prioritizes authenticity, durability, and handmade craft over brand names and trends. It\'s the difference between buying a mass-produced fanny pack and carrying a one-of-a-kind pouch that was hand-sewn by a fellow member of your community.</p>' +
      '<h2>Where It\'s Going</h2>' +
      '<p>The future of festival fashion is sustainable, handmade, and community-driven. Fast fashion festival outfits worn once and discarded are falling out of favor. More and more festivalgoers are investing in quality handmade pieces, supporting independent makers, and building wardrobes that evolve with them over years of adventures. Every patch, every repair, every new addition tells a story. That\'s what festival fashion was always meant to be.</p>',
  },
  {
    slug: 'why-handmade-matters',
    title: 'Why Handmade Matters in a Mass-Produced World',
    excerpt: 'In a world of identical factory-made goods, handmade items carry a different kind of value. Here\'s why choosing handmade matters more than ever.',
    date: '2026-02-21',
    category: 'culture',
    tags: ['handmade', 'sustainability', 'community', 'craft'],
    readTime: '5 min read',
    image: '/images/pink-checker-3.jpg',
    content: '<p>Open any fast fashion website and you can buy a bag for ten dollars. It\'ll arrive in a poly mailer, smell like chemicals, and fall apart within a few months. The zipper will stick, the strap will fray, and it\'ll end up in a landfill alongside 92 million tons of other textile waste generated globally each year. This is the true cost of cheap, mass-produced goods.</p>' +
      '<h2>The Hidden Costs of Cheap</h2>' +
      '<p>That ten dollar bag seems like a bargain until you count what went into making it. Underpaid labor in unsafe conditions. Synthetic materials derived from petroleum. Toxic dyes dumped into rivers. Thousands of miles of shipping. The real cost isn\'t ten dollars. It\'s externalized onto workers, communities, and the environment. When something costs less than a sandwich, someone else is paying the difference.</p>' +
      '<h2>What Handmade Actually Means</h2>' +
      '<p>A handmade piece is the opposite of all that. When you buy from an independent maker, you know exactly where your money goes. You\'re paying for quality materials selected by hand, hours of skilled labor, and the creative vision of someone who cares deeply about their craft. There\'s no faceless supply chain, no sweatshop, no corner-cutting. Just a person and a sewing machine, pouring their time and expertise into something built to last.</p>' +
      '<p>The quality difference is tangible. Handmade bags use heavier fabrics, stronger thread, and more robust construction techniques than their mass-produced counterparts. Seams are reinforced. Hardware is hand-set. Edges are finished properly instead of left raw. These details add up to a product that lasts years instead of months.</p>' +
      '<h2>Uniqueness You Can Feel</h2>' +
      '<p>Every handmade piece is slightly different. The fabric pattern falls in a unique way. The stitching has a human rhythm to it. The color combination exists on only one piece in the entire world. In a culture drowning in identical products, this kind of uniqueness has real value. Your bag isn\'t a copy of ten thousand others. It\'s genuinely one of one.</p>' +
      '<h2>Supporting Real People</h2>' +
      '<p>When you buy handmade, you\'re supporting a real person\'s dream. You\'re helping them pay rent, buy more materials, and keep doing work they love. That money circulates in local communities rather than flowing to corporate shareholders. It\'s a fundamentally different economic model, one that values people over profits and quality over quantity.</p>' +
      '<p>The handmade movement isn\'t about being anti-technology or anti-modern. It\'s about being intentional with your choices. It\'s about recognizing that the things you carry every day should be made with care, built to last, and connected to a real human story. That\'s not a luxury. That\'s just how things should be made.</p>',
  },
  {
    slug: 'the-art-of-the-drop',
    title: 'The Art of the Drop: How Limited Releases Build Community',
    excerpt: 'Drop culture turns product releases into shared events. Learn how limited drops build anticipation, loyalty, and genuine community.',
    date: '2026-02-18',
    category: 'culture',
    tags: ['drops', 'community', 'limited-release', 'wookwearwednesday'],
    readTime: '5 min read',
    image: '/images/display-mats-2.jpg',
    content: '<p>Every Wednesday, something special happens on the Wook Wear Instagram. A collection of brand-new, handmade pieces goes live. Each one is unique, made from a one-time combination of fabrics. Once they\'re gone, they\'re gone forever. This is the drop model, and it\'s transforming how independent makers connect with their communities.</p>' +
      '<h2>Why Drops Work</h2>' +
      '<p>The psychology behind drop culture is straightforward: scarcity creates urgency, and urgency creates engagement. When people know that a piece is truly one of a kind and will sell out within hours, they pay attention. They set reminders, they check back, they engage with every preview post leading up to the release. This isn\'t manufactured hype for mass-produced goods. For handmade makers, scarcity is simply the natural reality. Each piece takes hours to create, and there\'s only one pair of hands doing the work.</p>' +
      '<h2>The Wednesday Ritual</h2>' +
      '<p>Wook Wear Wednesday has become a genuine weekly ritual for thousands of followers. The format is consistent: preview posts throughout the week showing works in progress, a final reveal on Wednesday morning with all available pieces, and a scramble to claim favorites. Regulars know the drill, and newcomers get swept up in the energy. It\'s part shopping event, part community gathering, part art show.</p>' +
      '<p>The comment sections on drop days are as much a part of the experience as the products themselves. People celebrate each other\'s purchases, share excitement about specific fabrics, and build connections over shared aesthetic tastes. Collectors tag friends, swap styling tips, and post photos of their growing collections. A weekly product release has become a weekly community event.</p>' +
      '<h2>Building Loyalty Through Transparency</h2>' +
      '<p>What makes the drop model work for independent makers is transparency. Followers see the process: the fabric sourcing, the cutting, the sewing, the mistakes, and the finished product. By the time a piece drops, people have already formed a connection to it. They watched it come to life. This kind of transparency builds trust and loyalty that no amount of marketing budget can replicate.</p>' +
      '<h2>Drops vs. Traditional Retail</h2>' +
      '<p>Traditional retail is transactional. You walk into a store, pick something off a rack of identical items, and leave. There\'s no story, no anticipation, no community. The drop model flips this entirely. The anticipation before a release, the excitement during, and the satisfaction of owning something truly unique create an emotional experience that goes far beyond a simple purchase.</p>' +
      '<p>For makers, the drop model also solves the inventory problem. Instead of guessing what will sell and producing hundreds of units, you make what inspires you and release it when it\'s ready. No warehouse, no overstock, no waste. Every piece is made with intention and finds a home with someone who genuinely wanted it. That\'s a better model for the maker, the buyer, and the planet.</p>',
  },

  /* -------------------------------------------------------
     BEHIND THE SCENES
     ------------------------------------------------------- */
  {
    slug: 'from-sketch-to-stitch',
    title: 'From Sketch to Stitch: How a Wook Wear Piece Is Born',
    excerpt: 'Ever wonder how a Wook Wear piece goes from idea to finished product? Here\'s a behind-the-scenes look at the full creative process.',
    date: '2026-02-15',
    category: 'behind-the-scenes',
    tags: ['process', 'design', 'making', 'behind-the-scenes'],
    readTime: '5 min read',
    image: '/images/pink-checker-2.jpg',
    content: '<p>Every Wook Wear piece starts the same way: with a pile of fabrics on the worktable and an idea that needs to become real. The journey from that initial spark to a finished, ready-to-ship product involves more steps than most people realize. Here\'s what actually goes into making each piece.</p>' +
      '<h2>Design and Fabric Selection</h2>' +
      '<p>The design phase begins with fabric. Rather than sketching a design and then finding materials to match, the process often works in reverse. A new bolt of fabric arrives, maybe a wild checkerboard print or an unexpected sherpa color, and it sparks ideas about what it wants to become. What would pair well with it? What construction style would show it off best? The fabrics lead the way.</p>' +
      '<p>This is where the patchwork magic happens. Scraps from previous projects live in bins organized loosely by color and texture. Building a composition means pulling from these bins, laying pieces next to each other, auditioning combinations, and finding the arrangement that clicks. This part can take anywhere from ten minutes to an entire afternoon.</p>' +
      '<h2>Pattern and Cutting</h2>' +
      '<p>Once the design is set, it\'s time to cut. Base patterns exist for each product type: the prized possession pouch, the crossbody, the display mat, the buddy pouch. These patterns have been refined over hundreds of iterations, with seam allowances, hardware placement, and proportions dialed in precisely. The patterns get traced onto the wrong side of the fabric with chalk and cut with a rotary cutter on a self-healing mat.</p>' +
      '<h2>Sewing and Construction</h2>' +
      '<p>Construction follows a specific order for each product type. For a pouch, it typically goes: patchwork the outer panel, attach interfacing, sew the lining, install the snap hardware, join outer and lining panels, turn right side out, and finish the edges with blanket stitch binding. Each step has to happen in sequence because later steps depend on earlier ones being right.</p>' +
      '<p>This is where the sewing machine and hand stitching work together. The machine handles structural seams and topstitching, while hand sewing takes over for snap installation, edge finishing, and any decorative elements like sashiko stitching. A typical pouch takes between two and four hours from first cut to finished product, depending on complexity.</p>' +
      '<h2>Finishing and Quality Check</h2>' +
      '<p>Every finished piece gets a thorough once-over. Seams are checked for strength, snaps are tested for smooth operation, edges are inspected for consistent stitch spacing. Any loose threads are trimmed, and the piece gets a final press with a lint roller. Then it\'s photographed for the shop and stored in a clean, dry space until drop day.</p>' +
      '<p>The entire process, from fabric selection to finished product, is done by one pair of hands. That\'s both the challenge and the beauty of running a handmade brand. Every stitch carries the maker\'s intention, and every piece reflects the full arc of a creative process that values quality and authenticity above all else.</p>',
  },
  {
    slug: 'anatomy-of-a-prized-possession-pouch',
    title: 'Anatomy of a Prized Possession Pouch',
    excerpt: 'A Wook Wear pouch is more than just a bag. Take a detailed look at every component that makes a Prized Possession Pouch special.',
    date: '2026-02-12',
    category: 'behind-the-scenes',
    tags: ['pouch', 'construction', 'anatomy', 'details'],
    readTime: '5 min read',
    image: '/images/pouch-A-1.jpg',
    content: '<p>The Prized Possession Pouch is the heart of the Wook Wear lineup. It\'s the piece that started it all and the one that keeps evolving with every new drop. From the outside, it looks simple: a compact, pocketed pouch with a snap closure. But peel back the layers and there\'s a lot more going on than meets the eye.</p>' +
      '<h2>The Outer Shell</h2>' +
      '<p>The exterior panel is where the personality lives. This is typically a patchwork composition combining two to five different fabrics in an arrangement that\'s designed to be visually balanced while showcasing the most striking materials. The outer shell is cut from medium to heavy weight fabric, usually 8 to 12 ounce canvas or denim, and backed with woven interfacing to add structure without stiffness.</p>' +
      '<p>Every outer panel is unique. Even when the same fabrics appear across multiple pouches in a drop, the way they\'re cut and composed means no two panels are identical. The orientation of the pattern, the placement of each scrap, the proportions of the patchwork blocks: these are all decisions made in the moment, guided by instinct and experience.</p>' +
      '<h2>The Lining</h2>' +
      '<p>Inside, the pouch is fully lined with a complementary fabric. The lining serves multiple purposes: it creates a clean interior finish, hides all raw seam allowances, adds a second layer of protection for whatever you\'re carrying, and provides an opportunity for a surprise pop of color or pattern when you open the pouch. Linings are typically lighter weight than the exterior, around 4 to 6 ounces, because you don\'t want unnecessary bulk inside.</p>' +
      '<h2>The Snap Closure</h2>' +
      '<p>Prized Possession Pouches use heavy-duty snap closures that are hand-set with a snap setter tool. Snaps are preferred over zippers for several reasons: they\'re faster to open and close, they don\'t snag on fabric, they\'re easy to replace if they ever wear out, and they provide a satisfying tactile click that zippers can\'t match. Each snap is reinforced on the inside with a small square of interfacing to prevent it from pulling through the fabric over time.</p>' +
      '<h2>Blanket Stitch Binding</h2>' +
      '<p>The edge finishing is one of the most distinctive features. Rather than hiding the edges inside a turned seam, the raw edges are bound with a visible blanket stitch in contrasting thread. This technique wraps the outer and lining layers together along every exposed edge, creating a durable, beautiful border that frames the entire piece. The thread color is chosen to complement or contrast with the exterior fabrics, and the stitch spacing is kept consistent throughout.</p>' +
      '<h2>The Wook Wear Label</h2>' +
      '<p>Every pouch carries a hand-stitched Wook Wear label on the interior. This isn\'t a printed tag stuck in a seam. It\'s a woven label that\'s attached during construction, positioned so it\'s visible when you open the pouch but doesn\'t interfere with the contents. The label is more than branding. It\'s a mark of authenticity, a promise that this piece was made by hand with intention and care.</p>' +
      '<p>All of these components come together into something that fits in your hand but carries the weight of real craftsmanship. That\'s what makes a Prized Possession Pouch more than just a container. It\'s a small piece of art that you get to carry every day.</p>',
  },

  /* -------------------------------------------------------
     GUIDES
     ------------------------------------------------------- */
  {
    slug: 'how-to-care-for-handmade-bags',
    title: 'How to Care for Your Handmade Bag So It Lasts Forever',
    excerpt: 'Your handmade bag was built to last, but a little care goes a long way. Here are the essential tips for cleaning, storing, and maintaining your piece.',
    date: '2026-02-09',
    category: 'guides',
    tags: ['care', 'cleaning', 'maintenance', 'longevity'],
    readTime: '5 min read',
    image: '/images/collab-capsule-1.jpg',
    content: '<p>A well-made handmade bag can last decades with the right care. Unlike mass-produced accessories designed for a single season, handmade pieces are built with durable materials and solid construction techniques that actually improve with age. Here\'s how to keep your bag looking and performing its best for years to come.</p>' +
      '<h2>Day-to-Day Care</h2>' +
      '<p>The simplest care tip is also the most effective: empty your bag regularly and shake out debris. Crumbs, sand, dust, and small bits of whatever lives at the bottom of your bag can work their way into the fabric weave and cause premature wear. A quick shake-out once a week prevents buildup. For lint and pet hair, a lint roller is your best friend, especially for sherpa and fleece elements.</p>' +
      '<p>Avoid setting your bag directly on wet or dirty surfaces. This seems obvious, but at festivals and outdoor events, it\'s easy to forget. The bottom of a bag takes the most abuse, so keeping it off the ground when possible extends its life significantly. If your bag has a display mat companion piece, use it as a clean surface to set your bag on when you\'re posted up somewhere.</p>' +
      '<h2>Cleaning Cotton and Canvas</h2>' +
      '<p>For spot cleaning, use a damp cloth with a small amount of mild soap. Gently blot the stain rather than rubbing, which can push dirt deeper into the fibers. Let the area air dry completely before using the bag again. For deeper cleaning, you can hand wash most cotton and canvas bags in cool water with gentle detergent. Submerge the bag, let it soak for fifteen minutes, gently agitate, and rinse thoroughly.</p>' +
      '<p>Never machine wash a handmade bag. The agitation can stress seams, loosen hardware, and cause patchwork pieces to distort. Never put a bag in the dryer either, as heat can shrink cotton, melt interfacing adhesives, and damage snap closures. Always air dry flat on a clean towel, reshaping while damp.</p>' +
      '<h2>Caring for Denim and Waxed Canvas</h2>' +
      '<p>Denim is relatively low maintenance. Spot clean as needed and avoid machine washing to preserve the color depth. Raw denim will develop natural fading patterns over time, which is part of its charm. Waxed canvas should only be wiped with a damp cloth. If the wax coating starts to wear thin in high-contact areas, you can re-wax with a bar of fabric wax. Apply the wax to the surface, then use a hair dryer on medium heat to melt it into the fibers. Wipe off any excess and let it cure for twenty-four hours.</p>' +
      '<h2>Storage</h2>' +
      '<p>When you\'re not using your bag, store it in a cool, dry place away from direct sunlight. UV light fades dyes over time, especially on natural fibers. Stuff the bag lightly with clean tissue paper or a soft cloth to help it maintain its shape. Avoid storing bags in plastic, which traps moisture and can lead to mildew. A cotton dust bag or pillowcase works perfectly.</p>' +
      '<h2>Repairs</h2>' +
      '<p>One of the best things about handmade bags is that they can be repaired. A loose stitch can be re-sewn, a worn snap can be replaced, and a fraying edge can be re-bound. Don\'t toss a bag because of minor wear. Reach out to the maker, as most independent creators offer repair services and are happy to restore a piece they made. Every repair adds to the story and extends the life of something that was made with care.</p>',
  },
  {
    slug: 'checkerboard-pattern-everything',
    title: 'The Checkerboard Pattern: A Timeless Design That Never Gets Old',
    excerpt: 'From checkered flags to Vans sneakers to Wook Wear pouches, the checkerboard pattern is a design classic. Here\'s why it endures.',
    date: '2026-02-06',
    category: 'guides',
    tags: ['checkerboard', 'pattern', 'design', 'fashion'],
    readTime: '5 min read',
    image: '/images/pouch-E-1.jpg',
    content: '<p>The checkerboard pattern is everywhere, and it has been for centuries. Chess boards, racing flags, diner floors, punk rock, ska music, skateboarding, and now handmade festival gear. Something about that simple alternating grid of contrasting squares speaks to people across cultures and eras. It\'s one of the most enduring patterns in design history.</p>' +
      '<h2>A Brief History</h2>' +
      '<p>Checkerboard patterns appear in some of the earliest known textiles, dating back thousands of years. Ancient civilizations used them in mosaics, weavings, and pottery. The pattern\'s appeal is rooted in its mathematical simplicity: it\'s the most basic way to create visual rhythm with two contrasting colors. Your eye bounces back and forth between the squares, creating a sense of energy and movement that more complex patterns sometimes lack.</p>' +
      '<p>In the twentieth century, checkerboard took on countercultural significance. The two-tone ska movement of the 1960s adopted the black and white check as a symbol of racial unity. Punk and new wave bands plastered it on everything from album covers to stage backdrops. Vans made the checkerboard slip-on sneaker an icon of skateboard culture. Each subculture added its own layer of meaning to the same ancient grid.</p>' +
      '<h2>Why It Works on Handmade Goods</h2>' +
      '<p>The checkerboard pattern is ideal for patchwork and handmade textiles because it transforms simple square cuts into something visually striking. You don\'t need complex templates or curved cuts. Just squares. Alternating two fabrics in a grid creates instant visual impact, and the regularity of the pattern makes slight handmade variations feel intentional rather than accidental.</p>' +
      '<p>At Wook Wear, the checkerboard shows up in a distinctly psychedelic way. Rather than the crisp, uniform grid of a factory-printed check, the handmade version uses warped proportions, unexpected color combinations, and mixed fabric textures within the grid. A pink and black checkerboard in corduroy and cotton hits differently than the same pattern in a mass-produced print. The texture, the slight imperfections, and the dimensional quality of real pieced patchwork give it life.</p>' +
      '<h2>Warping the Grid</h2>' +
      '<p>One of the most interesting things you can do with a checkerboard is break it. Stretch the squares into rectangles. Rotate the grid at an angle. Vary the sizes so some squares are larger than others. Introduce a third color for a single accent square. These small disruptions take the pattern from familiar to unexpected while maintaining the underlying rhythm that makes it work.</p>' +
      '<p>Optical illusions are another avenue. By manipulating the size and placement of checkerboard squares, you can create the impression of curves, depth, or movement on a flat surface. These warped checkerboards are a staple of psychedelic art and fit perfectly into the festival aesthetic. They catch the eye and reward closer inspection.</p>' +
      '<h2>Making It Your Own</h2>' +
      '<p>If you want to try a checkerboard patchwork project, start simple. Cut equal squares from two contrasting fabrics, arrange them in a grid, and piece them together with quarter inch seams. Once you\'re comfortable with the basic grid, experiment with scale, color, and proportion. Swap one fabric for a textured material like corduroy or sherpa. Offset every other row by half a square for a brick-lay variation. The checkerboard is a foundation, and what you build on top of it is entirely up to you.</p>',
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
