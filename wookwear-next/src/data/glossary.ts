export interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  category: string;
}

export const GLOSSARY_CATEGORIES = [
  'techniques',
  'materials',
  'tools',
  'construction',
] as const;

export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  techniques: 'Techniques',
  materials: 'Materials',
  tools: 'Tools',
  construction: 'Construction',
};

export const glossaryTerms: GlossaryTerm[] = [
  /* --- Techniques --- */
  {
    term: 'Sashiko',
    slug: 'sashiko',
    definition: 'A Japanese form of decorative reinforcement stitching that uses a simple running stitch to create geometric patterns. Originally used to mend and strengthen worn clothing, sashiko is now prized for its meditative process and striking visual texture.',
    category: 'techniques',
  },
  {
    term: 'Blanket Stitch',
    slug: 'blanket-stitch',
    definition: 'A hand-sewing stitch used to finish raw edges, creating a series of evenly spaced loops along the fabric border. Each stitch locks the previous one in place, forming a durable and decorative edge binding.',
    category: 'techniques',
  },
  {
    term: 'Backstitch',
    slug: 'backstitch',
    definition: 'A strong hand stitch where the needle goes backward into the end of the previous stitch before moving forward, creating a continuous, unbroken line. It is one of the most durable hand stitches and closely mimics a machine lockstitch.',
    category: 'techniques',
  },
  {
    term: 'Running Stitch',
    slug: 'running-stitch',
    definition: 'The most basic hand stitch, made by passing the needle in and out of the fabric at regular intervals. Simple and fast, it is used for basting, gathering, and decorative work like sashiko.',
    category: 'techniques',
  },
  {
    term: 'Whip Stitch',
    slug: 'whip-stitch',
    definition: 'A simple overcast stitch that wraps thread diagonally over a fabric edge, used to join two pieces together or finish raw edges. Quick to execute and useful for closing openings after turning a piece right side out.',
    category: 'techniques',
  },
  {
    term: 'Applique',
    slug: 'applique',
    definition: 'A technique where pieces of fabric are layered and stitched onto a base fabric to create decorative shapes and designs. Applique can be done by hand or machine and adds dimension and visual interest to flat surfaces.',
    category: 'techniques',
  },
  {
    term: 'Quilting',
    slug: 'quilting',
    definition: 'The process of stitching together two or more layers of fabric, typically a decorative top, batting for insulation, and a backing layer. Quilting stitches hold the layers together while creating patterns on the surface.',
    category: 'techniques',
  },
  {
    term: 'Patchwork',
    slug: 'patchwork',
    definition: 'A textile technique where small pieces of fabric are sewn together to create a larger design. Patchwork transforms scraps and offcuts into unique compositions and is the foundation of the Wook Wear aesthetic.',
    category: 'techniques',
  },
  {
    term: 'Embroidery',
    slug: 'embroidery',
    definition: 'The art of decorating fabric with needle and thread or yarn, using a variety of stitches to create patterns, images, or text. Embroidery can be functional, decorative, or both.',
    category: 'techniques',
  },
  {
    term: 'Cross-Stitch',
    slug: 'cross-stitch',
    definition: 'A form of embroidery that uses X-shaped stitches on an even-weave fabric to build up a pattern from a grid-based design. Popular for detailed pictorial work and text.',
    category: 'techniques',
  },
  {
    term: 'Chain Stitch',
    slug: 'chain-stitch',
    definition: 'A looped embroidery stitch that creates a chain-like pattern on the fabric surface. Each new loop passes through the previous one, forming a decorative line that is thicker and more textured than a backstitch.',
    category: 'techniques',
  },
  {
    term: 'French Knot',
    slug: 'french-knot',
    definition: 'A small, raised embroidery stitch created by wrapping thread around the needle before inserting it back into the fabric. French knots add dot-like texture and are used for eyes, flower centers, and decorative accents.',
    category: 'techniques',
  },
  {
    term: 'Topstitch',
    slug: 'topstitch',
    definition: 'A visible line of stitching sewn on the right side of the fabric, usually parallel to a seam or edge. Topstitching is both decorative and functional, keeping seam allowances flat and adding a polished finish.',
    category: 'techniques',
  },
  {
    term: 'Edgestitch',
    slug: 'edgestitch',
    definition: 'A line of stitching placed very close to a folded edge or seam, typically within an eighth of an inch. Edgestitching secures folds, keeps linings from rolling to the outside, and creates a crisp, professional finish.',
    category: 'techniques',
  },
  {
    term: 'Basting',
    slug: 'basting',
    definition: 'Temporary long stitches used to hold fabric layers in place before permanent sewing. Basting can be done by hand or machine and is removed after the final seam is sewn.',
    category: 'techniques',
  },
  {
    term: 'Gathering',
    slug: 'gathering',
    definition: 'A technique that draws fabric into soft folds by sewing a loose running stitch and then pulling the thread to bunch the material. Gathering creates ruffles, fullness, and dimensional texture in sewn projects.',
    category: 'techniques',
  },
  {
    term: 'Hemming',
    slug: 'hemming',
    definition: 'The process of folding and stitching a raw fabric edge to create a clean, finished border. Hems prevent fraying and give garments and textile projects a polished appearance.',
    category: 'techniques',
  },
  {
    term: 'Darning',
    slug: 'darning',
    definition: 'A mending technique that repairs holes or worn areas by weaving new thread across the damaged section, rebuilding the fabric structure. Visible darning has become a popular decorative repair style.',
    category: 'techniques',
  },
  {
    term: 'Felting',
    slug: 'felting',
    definition: 'The process of matting, condensing, and pressing fibers together to create a dense, non-woven fabric. Felting can be done with heat, moisture, and agitation (wet felting) or by repeatedly poking fibers with a barbed needle (needle felting).',
    category: 'techniques',
  },

  /* --- Materials --- */
  {
    term: 'Waxed Canvas',
    slug: 'waxed-canvas',
    definition: 'Cotton canvas treated with a wax-based coating that makes it water-resistant, durable, and beautifully patina-prone. Waxed canvas develops unique character marks over time and can be re-waxed when the finish wears thin.',
    category: 'materials',
  },
  {
    term: 'Sherpa',
    slug: 'sherpa',
    definition: 'A soft, curly-piled fabric that mimics the look and feel of sheep\'s wool. Typically made from polyester, sherpa has a bumpy textured side and a smooth knit backing, making it ideal for plush linings and cozy accents.',
    category: 'materials',
  },
  {
    term: 'Denim',
    slug: 'denim',
    definition: 'A sturdy cotton twill fabric woven with a diagonal rib pattern. Known for its durability and casual aesthetic, denim is a staple material for bags, pouches, and crossbody construction. It softens and fades beautifully with age.',
    category: 'materials',
  },
  {
    term: 'Corduroy',
    slug: 'corduroy',
    definition: 'A ridged fabric with raised parallel lines called wales, made from tufted cotton or cotton-blend fibers. Corduroy adds rich texture to patchwork and is valued for its soft hand feel and visual depth.',
    category: 'materials',
  },
  {
    term: 'Canvas',
    slug: 'canvas',
    definition: 'A heavyweight, plain-weave cotton or cotton-blend fabric known for its strength and durability. Canvas is the workhorse of bag making, available in a wide range of weights from 4 oz to 18 oz per square yard.',
    category: 'materials',
  },
  {
    term: 'Felt',
    slug: 'felt',
    definition: 'A dense, non-woven textile made by matting fibers together through heat, moisture, or pressure. Felt does not fray when cut, making it useful for applique, small accessories, and decorative elements.',
    category: 'materials',
  },
  {
    term: 'Fleece',
    slug: 'fleece',
    definition: 'A soft, synthetic fabric with a smooth, even pile on one or both sides. Lighter and flatter than sherpa, fleece is commonly used for linings, lightweight warmth layers, and comfortable bag interiors.',
    category: 'materials',
  },
  {
    term: 'Cotton',
    slug: 'cotton',
    definition: 'A natural fiber harvested from the cotton plant, prized for its breathability, softness, and versatility. Cotton can be woven into everything from lightweight voile to heavy canvas and takes dye exceptionally well.',
    category: 'materials',
  },
  {
    term: 'Polyester',
    slug: 'polyester',
    definition: 'A synthetic fiber made from petroleum-based polymers, valued for its durability, wrinkle resistance, and color retention. Polyester is used in sherpa, fleece, webbing, and many blended fabrics.',
    category: 'materials',
  },
  {
    term: 'Nylon',
    slug: 'nylon',
    definition: 'A strong, lightweight synthetic fabric with excellent abrasion resistance and water repellency. Ripstop nylon is especially popular for bags and outdoor gear because of its tear-resistant gridded weave.',
    category: 'materials',
  },
  {
    term: 'Interfacing',
    slug: 'interfacing',
    definition: 'A support material applied to the back of fabric to add body, structure, and stability. Available in fusible (iron-on) and sew-in varieties, interfacing is essential for giving bags and pouches their shape.',
    category: 'materials',
  },
  {
    term: 'Batting',
    slug: 'batting',
    definition: 'A layer of soft, lofty material placed between fabric layers to add padding and insulation. Made from cotton, polyester, or wool, batting is commonly used in quilting and padded bag construction.',
    category: 'materials',
  },
  {
    term: 'Bias Tape',
    slug: 'bias-tape',
    definition: 'Narrow strips of fabric cut on the diagonal grain, which gives them stretch and allows them to curve smoothly around edges. Bias tape is used to bind raw edges, encase seam allowances, and add a clean finish.',
    category: 'materials',
  },
  {
    term: 'Binding Tape',
    slug: 'binding-tape',
    definition: 'Pre-folded tape used to encase and finish raw fabric edges. Similar to bias tape but may be cut on the straight grain, binding tape provides a clean, durable edge finish for bags, mats, and other textile projects.',
    category: 'materials',
  },
  {
    term: 'Webbing',
    slug: 'webbing',
    definition: 'A strong, flat woven strip used for straps, handles, and reinforcement in bag construction. Typically made from nylon, polypropylene, or cotton, webbing carries heavy loads without stretching.',
    category: 'materials',
  },
  {
    term: 'Thread',
    slug: 'thread',
    definition: 'A thin, flexible strand of fiber used to sew materials together. Sewing thread comes in various weights and materials including cotton, polyester, and nylon, with heavier thread used for topstitching and structural seams.',
    category: 'materials',
  },
  {
    term: 'Yarn',
    slug: 'yarn',
    definition: 'A long, continuous strand of twisted fibers used for knitting, crocheting, embroidery, and decorative stitching. Heavier than thread, yarn creates bold, visible stitches and textured effects.',
    category: 'materials',
  },
  {
    term: 'Fusible Web',
    slug: 'fusible-web',
    definition: 'A thin adhesive material that bonds two fabric layers together when activated by heat from an iron. Fusible web is used for applique, hemming, and attaching patches without sewing.',
    category: 'materials',
  },

  /* --- Tools --- */
  {
    term: 'Rotary Cutter',
    slug: 'rotary-cutter',
    definition: 'A fabric-cutting tool with a circular rolling blade, similar to a pizza cutter. Rotary cutters make precise straight and curved cuts through multiple fabric layers and are used with a self-healing cutting mat.',
    category: 'tools',
  },
  {
    term: 'Cutting Mat',
    slug: 'cutting-mat',
    definition: 'A self-healing mat placed under fabric during rotary cutting to protect the work surface and extend blade life. Printed with grid lines and angle guides for accurate measuring and cutting.',
    category: 'tools',
  },
  {
    term: 'Seam Ripper',
    slug: 'seam-ripper',
    definition: 'A small, pointed tool used to cut and remove stitches when fixing mistakes or deconstructing seams. Every sewer\'s most-used tool and best friend, because mistakes are a normal part of the process.',
    category: 'tools',
  },
  {
    term: 'Bobbin',
    slug: 'bobbin',
    definition: 'A small spool that holds the lower thread in a sewing machine. The bobbin thread interlocks with the upper needle thread to form a lockstitch. Bobbins must be wound evenly and inserted correctly for smooth sewing.',
    category: 'tools',
  },
  {
    term: 'Presser Foot',
    slug: 'presser-foot',
    definition: 'The part of a sewing machine that holds fabric flat against the feed dogs during stitching. Different presser feet are used for different tasks: a walking foot for thick layers, a zipper foot for close edges, and a Teflon foot for sticky fabrics.',
    category: 'tools',
  },
  {
    term: 'Thimble',
    slug: 'thimble',
    definition: 'A small protective cap worn on the finger to push needles through heavy or layered fabric without injury. Essential for hand sewing through canvas, denim, and other thick materials.',
    category: 'tools',
  },
  {
    term: 'Pinking Shears',
    slug: 'pinking-shears',
    definition: 'Scissors with zigzag-shaped blades that cut fabric in a sawtooth pattern. The zigzag edge reduces fraying on woven fabrics by cutting across the threads at an angle rather than straight across.',
    category: 'tools',
  },
  {
    term: 'Snap Setter',
    slug: 'snap-setter',
    definition: 'A hand tool or plier-style press used to install metal snap fasteners into fabric. Snap setters apply even pressure to crimp snap components together, creating a secure, professional closure.',
    category: 'tools',
  },

  /* --- Construction --- */
  {
    term: 'Seam Allowance',
    slug: 'seam-allowance',
    definition: 'The area between the stitching line and the raw edge of the fabric. Standard seam allowances range from a quarter inch for patchwork to five-eighths of an inch for garments. Consistent seam allowances are critical for pieces that fit together properly.',
    category: 'construction',
  },
  {
    term: 'Selvage',
    slug: 'selvage',
    definition: 'The tightly woven finished edge that runs along both sides of a bolt of fabric, parallel to the warp threads. Selvage edges don\'t fray and are used as reference points for finding the grain line.',
    category: 'construction',
  },
  {
    term: 'Grain Line',
    slug: 'grain-line',
    definition: 'The direction of threads in a woven fabric. The lengthwise grain runs parallel to the selvage and has the least stretch. The crosswise grain runs perpendicular. The bias grain runs diagonally and has the most stretch.',
    category: 'construction',
  },
  {
    term: 'Warp and Weft',
    slug: 'warp-and-weft',
    definition: 'The two sets of threads that form a woven fabric. Warp threads run lengthwise on the loom and are held under tension. Weft threads are woven horizontally across the warp. Together they create the fabric\'s structure and strength.',
    category: 'construction',
  },
  {
    term: 'Right Side / Wrong Side',
    slug: 'right-side-wrong-side',
    definition: 'The right side of fabric is the front, intended to be visible in the finished piece. The wrong side is the back. Most sewing is done with right sides facing together so seams end up hidden on the inside.',
    category: 'construction',
  },
  {
    term: 'Fat Quarter',
    slug: 'fat-quarter',
    definition: 'A pre-cut piece of fabric measuring approximately 18 by 22 inches, created by cutting a half yard of fabric in half across its width. Fat quarters are popular with quilters and patchwork makers because their squarish shape yields more usable pieces than a standard quarter yard.',
    category: 'construction',
  },
  {
    term: 'Quarter Inch Seam',
    slug: 'quarter-inch-seam',
    definition: 'A narrow seam allowance commonly used in quilting and patchwork. Sewing exactly a quarter inch from the fabric edge ensures that pieced blocks come out to the correct finished size and that multiple pieces align properly.',
    category: 'construction',
  },
  {
    term: 'Bar Tack',
    slug: 'bar-tack',
    definition: 'A dense cluster of closely spaced stitches used to reinforce high-stress points in a sewn item, such as strap attachments, pocket openings, and zipper ends. Bar tacks can withstand hundreds of pounds of pulling force.',
    category: 'construction',
  },
  {
    term: 'Grommet',
    slug: 'grommet',
    definition: 'A metal or plastic ring inserted into a hole in fabric to reinforce the opening and prevent tearing. Grommets are commonly used for drawstrings, lacing, and ventilation holes in bags and pouches.',
    category: 'construction',
  },
  {
    term: 'Snap Closure',
    slug: 'snap-closure',
    definition: 'A fastening system made of interlocking metal or plastic discs that click together when pressed. Snap closures are preferred on handmade bags for their ease of use, reliability, and satisfying tactile feedback.',
    category: 'construction',
  },
  {
    term: 'Piping',
    slug: 'piping',
    definition: 'A narrow fabric-covered cord inserted into a seam to create a raised decorative line along edges. Piping defines the shape of bags and cushions, adds visual contrast, and gives seams a professional, finished appearance.',
    category: 'construction',
  },
];

export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((t) => t.slug === slug);
}
