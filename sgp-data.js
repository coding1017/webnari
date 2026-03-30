(function() {
  'use strict';

  /* =========================================================
     MUSICIANS
     ========================================================= */
  var MUSICIANS = [

    /* -------------------------------------------------------
       Sam Grisman — Bass / Bandleader
       ------------------------------------------------------- */
    {
      slug: 'sam-grisman',
      name: 'Sam Grisman',
      instrument: 'Bass / Bandleader',
      photo: 'https://i0.wp.com/www.notreble.com/wp-content/uploads/2025/12/Sam-Grisman-with-Album-Cover.jpg?resize=1200%2C630&ssl=1',
      instagram: '@sgrisman',
      website: '',
      bio: '<p>Sam Grisman grew up in Mill Valley, California, surrounded by some of the most important acoustic musicians of the twentieth century. His father, David "Dawg" Grisman, is the mandolinist who essentially invented an entire genre, fusing bluegrass, jazz, and world music into what became known as Dawg music. Jerry Garcia was a regular visitor to the Grisman household, dropping by to pick old-time tunes and record the intimate acoustic sessions that would later become beloved albums in the Garcia/Grisman catalog. For Sam, this was not legend. It was Tuesday night.</p>' +
        '<p>Sam picked up the upright bass as a kid, drawn to its deep resonance and its role as the rhythmic and harmonic foundation of any acoustic ensemble. He spent over a decade as a touring sideman, honing his craft on stages across the country and absorbing the vocabularies of bluegrass, folk, jazz, and jam music. That breadth of experience gave him a fluency that allows him to lock in with virtually any player in any acoustic style, a skill that would prove essential when he launched his own project.</p>' +
        '<p>The Sam Grisman Project is not a traditional band with a fixed lineup. It is a rotating collective, a fluid ensemble built around Sam\'s bass playing and musical vision. The concept is both practical and philosophical. By inviting different combinations of musicians for different shows and recordings, Sam keeps the music alive and unpredictable, ensuring that every performance has its own character. The project carries forward the legacy of Dawg music and the Garcia/Grisman sessions while charting its own course through new compositions and fresh interpretations of classic material.</p>' +
        '<p>Now based in Nashville, Sam has positioned himself at the crossroads of the acoustic music world. The city\'s deep well of talent gives him access to an extraordinary roster of collaborators, from Grammy-winning fiddlers to young mandolin prodigies. Through SGP, he has created a vehicle that honors the tradition he was raised in while giving the next generation of acoustic musicians a platform to stretch out and be heard.</p>'
    },

    /* -------------------------------------------------------
       Max Flansburg — Guitar
       ------------------------------------------------------- */
    {
      slug: 'max-flansburg',
      name: 'Max Flansburg',
      instrument: 'Guitar',
      photo: 'https://i0.wp.com/www.roccitymag.com/wp-content/uploads/2021/08/maxflansburg_longroadhome.webp?fit=1583%2C1583&ssl=1',
      instagram: '@maxflansburg',
      website: '',
      bio: '<p>Max Flansburg is a guitarist and singer-songwriter from Rochester, New York, whose warm flatpicking style bridges the worlds of folk, bluegrass, and Americana. His playing is marked by a rich, full tone and an unhurried melodic sensibility that prioritizes feeling over flash. He can burn through a fiddle tune when the moment calls for it, but his greatest strength is his ability to make a simple melody sing with clarity and emotional weight.</p>' +
        '<p>Max released his album "Long Road Home," a collection of original songs that showcases his gifts as both a writer and a picker. The album draws on the folk traditions of upstate New York, the storytelling lineage of country music, and the improvisational spirit of the jam scene. His voice, understated and direct, pairs naturally with his guitar work, creating songs that feel lived-in rather than constructed.</p>' +
        '<p>As a member of the Sam Grisman Project\'s rotating roster, Max brings a guitarist\'s ear for accompaniment and arrangement. He is the kind of player who listens as much as he plays, finding the spaces in the music where a well-placed chord voicing or a tasteful melodic fill can elevate the entire ensemble. His rhythm playing is rock-solid, giving the group a dependable harmonic foundation over which the mandolins and fiddles can soar.</p>' +
        '<p>Beyond SGP, Max is an active performer and collaborator in the Northeast acoustic scene. He has shared stages with a wide range of artists and continues to develop his voice as a songwriter. His presence in the Sam Grisman Project adds a rootsy, song-oriented dimension that balances the group\'s more adventurous instrumental explorations.</p>'
    },

    /* -------------------------------------------------------
       Dominick Leslie — Mandolin
       ------------------------------------------------------- */
    {
      slug: 'dominick-leslie',
      name: 'Dominick Leslie',
      instrument: 'Mandolin',
      photo: 'https://bloximages.chicago2.vip.townnews.com/coloradocommunitymedia.com/content/tncms/assets/v3/editorial/7/c8/7c84521f-82b2-51c1-b5dc-6481704a34da/68bda76c2523a.image.jpg?resize=354%2C500',
      instagram: '@domles',
      website: '',
      bio: '<p>Dominick Leslie is one of the most exciting young mandolinists in acoustic music today. The son of guitarist John Leslie, Dominick grew up steeped in the traditions of bluegrass and folk music, absorbing the language of the genre from an early age. But his musical education did not stop at tradition. He developed a fluid, jazz-inflected approach to the mandolin that incorporates elements of swing, bebop, and progressive bluegrass into a style that is entirely his own.</p>' +
        '<p>Dominick\'s technical facility on the mandolin is formidable. He can navigate complex chord changes at speed, improvise melodic lines that arc and resolve with the logic of a jazz horn player, and deliver the driving rhythmic chop that is essential to any bluegrass ensemble. What sets him apart is the way he integrates all of these skills into a cohesive musical voice. His solos tell stories, building tension and releasing it with a natural sense of phrasing that belies his age.</p>' +
        '<p>He has been a presence in the progressive bluegrass scene, moving in circles adjacent to groups like Punch Brothers and performing with a range of high-profile acoustic artists. His ability to hold his own alongside seasoned veterans while bringing fresh ideas to the table has made him one of the most in-demand mandolinists of his generation. When he shows up on an SGP gig, the audience knows they are in for mandolin playing that honors David Grisman\'s legacy while pushing the instrument forward.</p>' +
        '<p>In the context of the Sam Grisman Project, Dominick occupies a particularly meaningful role. Playing mandolin in a group founded by the son of the greatest mandolinist in acoustic music history is not a responsibility anyone takes lightly. Dominick rises to it with creativity and respect, channeling the spirit of Dawg music while adding his own voice to the conversation.</p>'
    },

    /* -------------------------------------------------------
       John Mailander — Fiddle
       ------------------------------------------------------- */
    {
      slug: 'john-mailander',
      name: 'John Mailander',
      instrument: 'Fiddle',
      photo: 'https://images.squarespace-cdn.com/content/v1/5a89bd38d74cff315e0efa58/f87b49a3-00cf-469b-9eee-3bd772488d09/joihnmailander%C2%A1MichaelWeintrob-6320.jpg',
      instagram: '@johnmailander',
      website: '',
      bio: '<p>John Mailander is a Grammy-nominated fiddler and multi-instrumentalist based in Nashville whose evocative, deeply expressive tone has made him one of the most respected string players in American roots music. His playing draws from a vast palette of influences, including Appalachian fiddle traditions, Scandinavian folk music, jazz, and ambient soundscapes, resulting in a sound that is both deeply rooted and hauntingly contemporary.</p>' +
        '<p>John has recorded and performed with an extraordinary range of artists, including Punch Brothers, Sarah Jarosz, Jerry Douglas, and many others. His collaborative credits read like a directory of the finest acoustic musicians working today. He has also released acclaimed solo albums, including "Walk the Ground" and "Forecast," which showcase his compositional gifts and his ability to create immersive sonic worlds with the fiddle as the primary voice.</p>' +
        '<p>His Grammy nomination underscored what the acoustic music community already knew: Mailander is a generational talent. His tone, warm and singing with a slight edge that cuts through any mix, is instantly recognizable. He has the rare ability to make the fiddle whisper or wail with equal conviction, and his improvisational instincts are unerring. He plays what the music needs, never more and never less.</p>' +
        '<p>Within the Sam Grisman Project, John\'s fiddle provides a lyrical counterpoint to the rhythmic drive of the bass and mandolin. His background in both traditional and progressive acoustic music makes him an ideal fit for a project that aims to bridge the Garcia/Grisman legacy with contemporary approaches. When John Mailander picks up his bow, the room leans in.</p>'
    },

    /* -------------------------------------------------------
       Victor Furtado — Clawhammer Banjo
       ------------------------------------------------------- */
    {
      slug: 'victor-furtado',
      name: 'Victor Furtado',
      instrument: 'Clawhammer Banjo',
      photo: 'https://images.squarespace-cdn.com/content/v1/65e93c9cc1f04b4b748568d1/1715373269337-6V8SBYH5YSDG2517K2J0/image01.jpg',
      instagram: '@dirtbanjo',
      website: '',
      bio: '<p>Victor Furtado is a Brazilian-American clawhammer banjo player, guitarist, and vocalist who won the prestigious Steve Martin Prize for Excellence in Banjo and Bluegrass. The award, personally selected by Steve Martin himself, recognized Victor as one of the most promising young banjo talents in the country and placed him in the company of past winners who have gone on to shape the future of acoustic music.</p>' +
        '<p>Victor\'s clawhammer style is rooted in the old-time Appalachian tradition, but he brings a rhythmic intensity and creative flair that sets him apart from his peers. Where many clawhammer players lean into the gentle, rolling cadence of the style, Victor attacks the strings with a percussive drive that can propel an entire ensemble. His right hand generates a rhythmic complexity that draws from old-time dance music, West African banjo traditions, and his own Brazilian heritage, creating a sound that is both ancient and startlingly fresh.</p>' +
        '<p>In addition to his banjo work, Victor is a skilled guitarist and a compelling vocalist. He writes original songs that draw from folk, old-time, and Americana traditions, and his live performances are known for their energy and authenticity. He brings the spirit of the front porch into concert halls and festival stages without losing any of its intimacy.</p>' +
        '<p>When Victor joins the Sam Grisman Project, he adds a textural and rhythmic dimension that is unique within the ensemble. The clawhammer banjo occupies a different sonic space than the three-finger Scruggs style more commonly associated with bluegrass, and its presence in SGP\'s lineup connects the project to the deeper, older roots of American string band music. Victor\'s playing is a reminder that the banjo\'s history is far richer and more varied than any single genre can contain.</p>'
    },

    /* -------------------------------------------------------
       Alex Hargreaves — Fiddle
       ------------------------------------------------------- */
    {
      slug: 'alex-hargreaves',
      name: 'Alex Hargreaves',
      instrument: 'Fiddle',
      photo: 'https://liveoakfiddlecamp.com/wp-content/uploads/alex-hargreaves.jpg',
      instagram: '@alexhargreaves.music',
      website: '',
      bio: '<p>Alex Hargreaves is an award-winning fiddler whose versatility has made him one of the most sought-after string players in acoustic music. He has toured internationally with the Milk Carton Kids, Molly Tuttle, and a host of other prominent artists, demonstrating an ability to adapt his playing to wildly different musical contexts while maintaining his own distinctive voice. Whether he is backing a singer-songwriter with spare, melodic lines or tearing through a bluegrass breakdown at full speed, Alex plays with precision and feeling.</p>' +
        '<p>His competition credentials are impressive. Alex has won major fiddle contests and his playing reflects the discipline and technical command that competition demands. But what makes him special is what happens after the technique. His tone is warm and supple, his vibrato expressive without being showy, and his sense of rhythm is impeccable. He plays with the kind of relaxed confidence that only comes from deep mastery of the instrument.</p>' +
        '<p>Alex is equally comfortable in bluegrass, swing, classical, and folk settings, a range that speaks to both his natural musicality and his dedication to studying multiple traditions with equal seriousness. He serves as faculty at Live Oak Fiddle Camp, where he shares his knowledge with the next generation of fiddlers. His teaching, like his playing, emphasizes musicality and expression over mere technical achievement.</p>' +
        '<p>In the Sam Grisman Project, Alex brings a fiddler\'s sensitivity to ensemble playing. He knows when to step forward and when to lay back, when to double a melody and when to provide a harmonic counterline. His experience touring with diverse acts gives him a chameleon-like adaptability that is invaluable in a rotating collective where the lineup and the repertoire can change from show to show.</p>'
    },

    /* -------------------------------------------------------
       Nat Smith — Cello
       ------------------------------------------------------- */
    {
      slug: 'nat-smith',
      name: 'Nat Smith',
      instrument: 'Cello',
      photo: 'https://images.squarespace-cdn.com/content/v1/54e8fcf5e4b032bc082d6d6f/1424967146154-D6HJA2LLK3Z4NJLSM5U8/nathanielsmith.jpg',
      instagram: '@nawms.music',
      website: '',
      bio: '<p>Nat Smith, also known as Nathaniel Smith, is an innovative cellist who has spent his career expanding the boundaries of what the cello can do in acoustic and roots music settings. Classically trained but restlessly creative, Nat brings a toolkit to the stage that includes looping, effects pedals, extended techniques, and an encyclopedic knowledge of musical traditions from bluegrass to electronic ambient music. The result is a cello sound that is unlike anything else in the acoustic world.</p>' +
        '<p>His approach to the instrument is fundamentally reimagined. Where the cello traditionally serves as a supporting voice in ensemble settings, Nat transforms it into a lead instrument, a rhythm section, and an atmospheric soundscape generator, sometimes all within the same song. His use of looping technology allows him to build layered arrangements in real time, creating the impression of a full ensemble from a single instrument. It is a thrilling thing to witness live.</p>' +
        '<p>Nat has collaborated with a wide range of artists across genres, from bluegrass pickers to electronic producers. His ability to speak multiple musical languages fluently makes him an exceptionally versatile collaborator. He brings a deep understanding of classical harmony and form to every project, grounding even his most experimental work in solid musicianship.</p>' +
        '<p>When Nat joins the Sam Grisman Project, he adds a low-end richness and textural depth that transforms the ensemble\'s sound. The cello\'s range overlaps with both the bass and the fiddle, allowing Nat to move between supporting the rhythm section and soaring above the group with lyrical melodies. His presence pushes SGP into territory that most acoustic groups never explore, which is exactly the kind of creative expansion that defines the project\'s mission.</p>'
    },

    /* -------------------------------------------------------
       Joe K. Walsh — Mandolin
       ------------------------------------------------------- */
    {
      slug: 'joe-k-walsh',
      name: 'Joe K. Walsh',
      instrument: 'Mandolin',
      photo: 'https://images.squarespace-cdn.com/content/v1/58a35b9886e6c0a1ebccc705/1512683280698-1M5GHRI3VTW40MTH3W15/Joe_K_Walsh_HighRes%2B%283%2Bof%2B6%29.jpg',
      instagram: '@joe_k_walsh',
      website: '',
      bio: '<p>Joe K. Walsh is an acclaimed mandolinist, Northfield Mandolins artist, and one of the most respected voices on the instrument in contemporary acoustic music. His playing is defined by a clean, bell-like tone, sophisticated melodic sensibility, and a deep understanding of the mandolin\'s role in both traditional and progressive settings. He approaches the instrument with the rigor of a classical musician and the spontaneity of a jazz improviser, a combination that makes his playing both intellectually satisfying and emotionally compelling.</p>' +
        '<p>Joe has performed and recorded with a remarkably wide range of acoustic artists, establishing himself as a first-call mandolinist for studio sessions and live performances alike. His ability to read a room and serve the music, whether that means delivering a blazing tremolo passage or laying down a subtle rhythmic chop, has earned him the trust of bandleaders and producers across the genre. He is the kind of musician that other musicians love to play with because he elevates everyone around him.</p>' +
        '<p>Beyond performing, Joe is deeply committed to the mandolin community. He teaches, builds mandolins, and contributes to the ongoing development of the instrument\'s repertoire and technique. His association with Northfield Mandolins reflects his interest in the craft of instrument building and his belief that the quality of the tool matters as much as the skill of the player. He is a student of the mandolin in every sense, always learning, always refining, always pushing toward a more perfect expression of the music he hears in his head.</p>' +
        '<p>In the Sam Grisman Project, Joe\'s mandolin playing connects directly to the David Grisman lineage. His clean tone and melodic sophistication echo the clarity and invention that defined Dawg music, while his own musical personality ensures that the sound is never mere imitation. Joe brings authority and grace to the mandolin chair in SGP, honoring the tradition while adding his own chapter to the story.</p>'
    }
  ];


  /* =========================================================
     BLOG POSTS
     ========================================================= */
  var BLOG_POSTS = [

    /* -------------------------------------------------------
       HISTORY
       ------------------------------------------------------- */
    {
      slug: 'garcia-grisman-sessions',
      title: 'The Garcia/Grisman Sessions: A Musical Legacy',
      excerpt: 'The acoustic recordings between Jerry Garcia and David Grisman produced some of the most intimate and inventive music of the late twentieth century. Their sessions reshaped what acoustic music could be.',
      date: '2026-03-28',
      category: 'history',
      tags: ['jerry-garcia', 'david-grisman', 'acoustic', 'garcia-grisman', 'legacy'],
      readTime: '7 min read',
      content: '<p>In the late 1980s and early 1990s, two of the most creative minds in American acoustic music began meeting regularly at a small studio in Mill Valley, California. Jerry Garcia, best known as the leader of the Grateful Dead, and David "Dawg" Grisman, the mandolinist who had redefined the instrument\'s possibilities, sat down together to play the music they loved. No arena stages, no light shows, no electric guitars. Just two friends, an acoustic guitar and a mandolin, exploring a shared love of traditional American music with the curiosity and skill that had defined their individual careers.</p>' +
        '<h2>The Mill Valley Sessions</h2>' +
        '<p>The sessions that produced the Garcia/Grisman album and its follow-ups were remarkably informal. Garcia and Grisman would sit in the studio, often with a small group of additional musicians, and work through folk songs, bluegrass standards, original compositions, and obscure gems from the American songbook. The atmosphere was loose and collaborative, more like a living room picking session than a formal recording date. This relaxed energy is audible in every track. The music breathes in a way that studio recordings rarely do.</p>' +
        '<p>Their self-titled debut, "Garcia/Grisman," released in 1991, was a revelation. Acoustic guitar and mandolin conversations that ranged from playful to profound, shot through with the kind of telepathic interplay that only comes from years of musical friendship. Tracks like "The Thrill Is Gone" and "Russian Lullaby" demonstrated that Garcia was as compelling on acoustic guitar as he was on electric, while Grisman\'s mandolin danced around the melodies with his characteristic blend of precision and daring.</p>' +
        '<h2>A Musical Friendship</h2>' +
        '<p>Garcia and Grisman\'s friendship stretched back to the 1960s, when both were part of the thriving folk and bluegrass scene in the San Francisco Bay Area. They had played together in various configurations over the years, including the legendary bluegrass supergroup Old and In the Way. But the Garcia/Grisman sessions represented something different: a mature, unhurried exploration of the music that had brought them together in the first place. There was nothing to prove and nowhere to be. Just the joy of playing.</p>' +
        '<p>The recordings continued with "Not for Kids Only," a collection of children\'s songs that was far more musically sophisticated than its title suggested, and "Shady Grove," which delved deeper into traditional material. Each album revealed new facets of the partnership and demonstrated the seemingly bottomless well of repertoire that both men carried in their heads. Garcia\'s passing in 1995 brought the sessions to a permanent close, lending the recordings an added poignancy that deepens with each passing year.</p>' +
        '<h2>The Legacy Lives On</h2>' +
        '<p>The Garcia/Grisman recordings did more than produce great music. They demonstrated that acoustic music could be adventurous, that tradition and innovation were not enemies, and that some of the most powerful music happens when virtuosos set aside ego and simply listen to each other. Sam Grisman, who grew up watching these sessions unfold in his own home, carries this lesson at the core of the Sam Grisman Project. Every SGP performance is, in some sense, a continuation of those Mill Valley evenings when the music was the only thing that mattered.</p>'
    },

    {
      slug: 'old-and-in-the-way',
      title: 'Old & In The Way: The Bluegrass Supergroup',
      excerpt: 'When Jerry Garcia, David Grisman, Peter Rowan, Vassar Clements, and John Kahn formed a bluegrass band in 1973, nobody expected it to become one of the most influential acoustic recordings of all time.',
      date: '2026-03-20',
      category: 'history',
      tags: ['old-and-in-the-way', 'jerry-garcia', 'david-grisman', 'peter-rowan', 'vassar-clements', 'bluegrass'],
      readTime: '7 min read',
      content: '<p>Old and In the Way was never supposed to be a big deal. In 1973, Jerry Garcia was at the height of the Grateful Dead\'s commercial and creative powers, but his love of bluegrass and traditional acoustic music had never dimmed. David Grisman was deep into developing the jazz-inflected acoustic style that would become Dawg music. Peter Rowan, a gifted singer and guitarist who had played with Bill Monroe himself, was between projects. Fiddler Vassar Clements was a living legend of country and bluegrass violin. And bassist John Kahn was Garcia\'s trusted musical partner from his various side projects. When they came together to play bluegrass, the combination was electric.</p>' +
        '<h2>The Band</h2>' +
        '<p>The lineup was staggering in its collective pedigree. Garcia played banjo, not guitar, returning to the instrument he had studied obsessively in the early 1960s before the Grateful Dead consumed his life. His banjo playing was unconventional by bluegrass standards, with a fluid, melodic approach that reflected his years of improvisational experience. Grisman\'s mandolin was already pushing beyond traditional bluegrass vocabulary. Rowan\'s powerful tenor voice was steeped in the high lonesome sound. And Clements, who had played with everyone from Bill Monroe to the Allman Brothers, could make a fiddle do things that defied categorization.</p>' +
        '<p>The band played a relatively small number of shows, mostly in the San Francisco Bay Area, between 1973 and 1975. They never went into a proper studio to record an album. But the live recordings captured during their performances, particularly the self-titled album released in 1975, became one of the best-selling bluegrass records of all time. The Grateful Dead\'s massive fanbase discovered bluegrass through Garcia\'s involvement, and many of them never looked back.</p>' +
        '<h2>The Sound</h2>' +
        '<p>What made Old and In the Way special was not just the talent assembled but the way these musicians approached traditional material. They played bluegrass standards with genuine respect for the tradition but filtered through sensibilities shaped by rock, jazz, and folk. The tempos ran hot, the improvisations stretched longer than traditional bluegrass would typically allow, and the energy of the performances crackled with the electricity of musicians who were thrilled to be playing together. Songs like "Midnight Moonlight," "Pig in a Pen," and "Panama Red" became touchstones for a generation of acoustic musicians.</p>' +
        '<p>Vassar Clements\' fiddle playing on these recordings deserves special mention. His ability to weave between bluegrass, swing, and country styles within a single solo was mesmerizing, and his interplay with Grisman\'s mandolin created moments of breathtaking beauty. The rhythm section of Garcia\'s banjo and Kahn\'s bass provided a propulsive foundation that kept the music grounded even as the soloists ventured into adventurous territory.</p>' +
        '<h2>The Lasting Impact</h2>' +
        '<p>Old and In the Way planted a seed that continues to bear fruit decades later. The band demonstrated that bluegrass could appeal to rock audiences without being diluted or condescended to. It showed that world-class musicians from different traditions could come together around acoustic instruments and create something that honored the past while sounding completely alive in the present. The Sam Grisman Project exists in the direct lineage of this philosophy. When SGP takes the stage with a rotating cast of virtuosos playing acoustic music that refuses to be confined by genre boundaries, the spirit of Old and In the Way is very much in the room.</p>'
    },

    /* -------------------------------------------------------
       MUSIC
       ------------------------------------------------------- */
    {
      slug: 'what-is-dawg-music',
      title: 'What Is Dawg Music?',
      excerpt: 'David Grisman invented an entirely new genre by fusing bluegrass, jazz, and world music. Understanding Dawg music is essential to understanding the Sam Grisman Project.',
      date: '2026-03-25',
      category: 'music',
      tags: ['dawg-music', 'david-grisman', 'genre', 'jazz', 'bluegrass', 'fusion'],
      readTime: '6 min read',
      content: '<p>Ask ten acoustic musicians to define Dawg music and you will get ten different answers, all of them partially correct. The genre, if it can even be called that, was created by mandolinist David Grisman beginning in the mid-1970s. Its name comes from Grisman\'s nickname, "Dawg," given to him by Jerry Garcia. At its core, Dawg music is the sound of a bluegrass-trained mandolinist who fell in love with jazz, Brazilian music, classical composition, and swing, and refused to choose between any of them.</p>' +
        '<h2>The Ingredients</h2>' +
        '<p>Dawg music starts with the instrumentation and rhythmic drive of bluegrass. Mandolin, guitar, bass, and fiddle form the core ensemble, and the music moves with the forward momentum that is characteristic of string band music. But the harmonic language is borrowed from jazz. Extended chords, modal explorations, and improvised solos built on chord changes rather than pentatonic scales give Dawg music a sophistication that sets it apart from traditional bluegrass. Add to this the melodic influence of world music traditions, particularly Brazilian choro and European folk, and you begin to understand the scope of Grisman\'s vision.</p>' +
        '<p>The result is music that swings, that grooves, that surprises, and that rewards repeated listening. A Dawg music composition might begin with a catchy, folk-like melody, modulate through a series of unexpected key changes during the solo section, and resolve with a rhythmic intensity that makes the audience want to dance. It is intellectual without being inaccessible, complex without being cold.</p>' +
        '<h2>The David Grisman Quintet</h2>' +
        '<p>Grisman\'s primary vehicle for Dawg music was the David Grisman Quintet, which he formed in the late 1970s. The DGQ, as fans know it, became a laboratory for this new sound, with Grisman composing original music specifically designed to showcase the fusion of styles he was pioneering. Albums like "The David Grisman Quintet" and "Hot Dawg" introduced the world to a sound that had no precedent. The DGQ featured some of the finest acoustic musicians in the world, including violinist Darol Anger, guitarist Tony Rice, and a succession of remarkable bass players and rhythm guitarists.</p>' +
        '<p>The influence of the DGQ extended far beyond its own discography. It showed an entire generation of acoustic musicians that tradition was a starting point, not a destination. You could honor bluegrass while incorporating jazz harmony. You could swing hard while playing mandolin. You could compose intricate, through-written pieces for acoustic instruments that demanded the same level of musicianship as any jazz combo or classical chamber group.</p>' +
        '<h2>Dawg Music and SGP</h2>' +
        '<p>The Sam Grisman Project is, in many ways, the next chapter in the Dawg music story. Sam grew up hearing this music at the dinner table, and its DNA is woven into everything SGP does. The project does not simply replicate Dawg music. It extends it, incorporating the influences and sensibilities of a new generation of musicians while maintaining the core principles of improvisational excellence, genre fluidity, and acoustic integrity that David Grisman established. When you hear SGP play, you hear the past and the future of acoustic music in the same breath.</p>'
    },

    {
      slug: 'upright-bass-bluegrass',
      title: 'The Upright Bass in Bluegrass',
      excerpt: 'The upright bass is the heartbeat of every bluegrass band. From slap bass to walking lines, here is why this instrument matters more than most people realize.',
      date: '2026-03-15',
      category: 'music',
      tags: ['upright-bass', 'bluegrass', 'instruments', 'technique', 'rhythm'],
      readTime: '6 min read',
      content: '<p>In a bluegrass band, every instrument gets its moment in the spotlight except one. The upright bass rarely takes a solo. It does not play the flashy runs that make audiences gasp or the high lonesome melodies that make them weep. What it does is hold the entire ensemble together, providing the rhythmic pulse and harmonic foundation upon which everything else is built. Without the bass, a bluegrass band is a collection of treble instruments fighting for space. With it, the music has gravity, depth, and drive.</p>' +
        '<h2>The Role of the Bass</h2>' +
        '<p>In traditional bluegrass, the bass player\'s primary job is to outline the chord progression and keep steady time. This sounds simple, and in a way it is. But the simplicity is deceptive. The bass player must have impeccable time feel, an intuitive understanding of harmony, and the physical endurance to propel a band through a three-hour show without flagging. A good bass player makes everyone in the band sound better. A bad one makes everyone sound worse. There is no instrument in bluegrass where the gap between competent and excellent has a greater impact on the overall sound.</p>' +
        '<p>The classic bluegrass bass pattern alternates between the root and the fifth of each chord, creating a bouncing, propulsive feel that drives the music forward. This "boom-chuck" pattern is the rhythmic engine of the genre. But within this seemingly rigid framework, there is enormous room for creativity. The best bass players find subtle ways to vary their note choices, anticipate chord changes, and interact with the other instruments while never losing the groove.</p>' +
        '<h2>Beyond the Boom-Chuck</h2>' +
        '<p>Modern acoustic bass players, Sam Grisman among them, have expanded the vocabulary of the instrument far beyond its traditional role. Walking bass lines borrowed from jazz, melodic passages that function as countermelodies, and rhythmic techniques drawn from Latin and folk traditions have all found their way into contemporary bluegrass and acoustic music. The instrument\'s expressive range has grown enormously, and today\'s best players are as technically accomplished as any instrumentalist on the stage.</p>' +
        '<p>Sam Grisman\'s bass playing reflects this evolution. Raised on Dawg music and traditional bluegrass but influenced by jazz and jam music, he brings a harmonic sophistication and rhythmic flexibility to the bass chair that expands what the Sam Grisman Project can do musically. His lines walk, they groove, they breathe. He knows when to lay down a simple root-fifth pattern and when to venture into more adventurous territory, and his judgment in this regard is a big part of what makes SGP\'s music work.</p>' +
        '<h2>The Physical Instrument</h2>' +
        '<p>The upright bass, also called the double bass or string bass, is the largest and lowest-pitched instrument in the string family. In bluegrass, it is almost always played pizzicato, meaning the strings are plucked rather than bowed. The physicality of the instrument is a significant part of its appeal. Playing upright bass is a full-body experience that requires strength, coordination, and stamina. The deep, woody tone of a well-made upright bass resonating in a room is one of the most satisfying sounds in all of acoustic music, and it is the sound that anchors every Sam Grisman Project performance.</p>'
    },

    {
      slug: 'clawhammer-vs-three-finger',
      title: 'Clawhammer vs Three-Finger Banjo',
      excerpt: 'Two techniques, two traditions, two completely different sounds. Here is everything you need to know about the great banjo divide.',
      date: '2026-03-10',
      category: 'music',
      tags: ['banjo', 'clawhammer', 'three-finger', 'scruggs', 'old-time', 'technique'],
      readTime: '6 min read',
      content: '<p>The banjo is one of the most versatile and misunderstood instruments in American music, and the single biggest source of confusion is the fact that there are two fundamentally different ways to play it. Clawhammer, also called frailing or drop-thumb, is the older technique, rooted in the African origins of the instrument and the old-time music of Appalachia. Three-finger picking, perfected by Earl Scruggs in the 1940s, is the technique most associated with bluegrass. They sound completely different, they come from different traditions, and the debates between their respective partisans can get surprisingly heated.</p>' +
        '<h2>Clawhammer: The Downstroke</h2>' +
        '<p>In clawhammer banjo, the player strikes the strings with a downward motion of the hand, using the back of the fingernail or the fingertip to brush across the strings while the thumb catches the short fifth string on the upbeat. The result is a rhythmic, percussive sound that is closer to drumming than to picking. Clawhammer has a rolling, hypnotic quality that lends itself naturally to old-time dance music, ballads, and the droning modal tunes of the Appalachian tradition.</p>' +
        '<p>The technique is ancient in origin, tracing back to the gourd banjos and playing styles brought to the Americas by enslaved West Africans. Over centuries, it evolved in the mountains of Appalachia into the style we recognize today. Clawhammer is the sound of front porch music, of square dances and late-night picking sessions, of a tradition that stretches back further than any living memory. SGP member Victor Furtado is one of the finest clawhammer players of his generation, and his playing embodies this deep history while pushing the technique in new directions.</p>' +
        '<h2>Three-Finger: The Scruggs Style</h2>' +
        '<p>Earl Scruggs changed everything. When the young North Carolinian joined Bill Monroe\'s Blue Grass Boys in 1945, his three-finger picking technique, which used the thumb, index, and middle fingers in rapid, syncopated rolls, was unlike anything audiences had heard. The sound was bright, fast, and explosively exciting, and it became the defining instrumental voice of bluegrass music. Scruggs-style picking, as it came to be known, uses fingerpicks and a specific set of right-hand roll patterns to produce a continuous cascade of notes that can be dazzling at speed.</p>' +
        '<p>Three-finger banjo is the sound most people associate with the instrument. "Foggy Mountain Breakdown," "Dueling Banjos," the Beverly Hillbillies theme song, all Scruggs-style. The technique opened up a world of melodic and harmonic possibilities that clawhammer, with its more limited note-by-note approach, could not easily access. Chromatic passages, complex arpeggios, and blazing-fast scale runs became part of the banjo\'s vocabulary for the first time.</p>' +
        '<h2>Two Traditions, One Instrument</h2>' +
        '<p>The beauty of the banjo is that it contains multitudes. Clawhammer and three-finger are not competing techniques so much as parallel traditions, each with its own history, repertoire, and aesthetic values. The Sam Grisman Project embraces this breadth. When a clawhammer player like Victor Furtado joins the lineup, the music takes on a rootsy, old-time flavor that connects to the deepest strata of American string band music. When a three-finger player sits in, the energy shifts toward the brighter, more pyrotechnic sound of bluegrass. Both approaches serve the music, and both have a place in the SGP universe.</p>'
    },

    {
      slug: 'essential-bluegrass-albums',
      title: 'Essential Bluegrass Albums Every Fan Should Own',
      excerpt: 'From Bill Monroe to modern progressive bluegrass, these are the recordings that define the genre and belong in every collection.',
      date: '2026-03-05',
      category: 'music',
      tags: ['bluegrass', 'albums', 'essential-listening', 'bill-monroe', 'flatt-and-scruggs', 'recommendations'],
      readTime: '7 min read',
      content: '<p>Bluegrass has a recorded history that stretches back to the mid-1940s, and the genre has produced a staggering wealth of great music in the decades since. For newcomers, the sheer volume of recordings can be overwhelming. Where do you start? What albums represent the essential listening that every fan of acoustic music should experience? While any such list is inherently subjective, certain recordings are so foundational, so influential, and so musically excellent that their inclusion is beyond debate.</p>' +
        '<h2>The Foundations</h2>' +
        '<p>Any serious exploration of bluegrass must begin with Bill Monroe, the man who gave the genre its name. His recordings with the Blue Grass Boys from the late 1940s through the 1950s established the template: driving rhythm, high lonesome vocals, and virtuosic instrumental breaks. The compilation "The Essential Bill Monroe and His Blue Grass Boys" covers this period comprehensively and belongs in every collection. Equally essential is Flatt and Scruggs\' "Foggy Mountain Banjo," the album that introduced Earl Scruggs\' revolutionary three-finger picking to the world and changed the banjo forever.</p>' +
        '<p>The Stanley Brothers represent another foundational pillar. Their recordings from the 1950s and 1960s, particularly the compilation "The Complete Columbia Recordings," showcase some of the most haunting vocal harmonies in all of American music. Ralph Stanley\'s banjo playing and Carter Stanley\'s lead vocals created a sound that was rawer and more emotionally direct than the Monroe style, and their influence on subsequent generations of bluegrass musicians has been immense.</p>' +
        '<h2>The Innovators</h2>' +
        '<p>The New Grass Revival, led by Sam Bush, blew the doors off traditional bluegrass in the 1970s and 1980s, incorporating rock, jazz, and world music into the acoustic format. Their album "Fly Through the Country" is a landmark of progressive bluegrass. Tony Rice\'s "Manzanita" is perhaps the single greatest flatpicking guitar album ever recorded, a masterclass in tone, taste, and technique that remains the standard against which all acoustic guitar playing is measured. And of course, the Garcia/Grisman albums represent an essential bridge between the worlds of bluegrass, Dawg music, and the broader American musical landscape.</p>' +
        '<p>Bela Fleck\'s "Drive" pushed banjo playing into jazz and classical territory while never losing its bluegrass roots, and the original Punch Brothers album "Punch" announced the arrival of a new generation of progressive acoustic musicians who could play anything and chose to play everything. These recordings demonstrate that bluegrass is not a museum piece but a living, evolving art form.</p>' +
        '<h2>Building Your Collection</h2>' +
        '<p>The beauty of exploring bluegrass through its recorded history is that every album leads to ten more. Follow the thread from Bill Monroe to Tony Rice to David Grisman to the Sam Grisman Project and you will trace one lineage of the music\'s evolution. Follow it from the Stanley Brothers to Ralph Stanley to the high lonesome sound of modern traditional bluegrass and you will trace another. The genre is deep enough to reward a lifetime of listening, and the recordings listed here are doorways into a world of acoustic music that is as rich and varied as any genre in American history.</p>'
    },

    /* -------------------------------------------------------
       TOURING
       ------------------------------------------------------- */
    {
      slug: 'recording-temple-cabin',
      title: 'Behind the Scenes: Recording Temple Cabin Sessions',
      excerpt: 'A look inside how the Sam Grisman Project records its intimate, stripped-down sessions and why the setting matters as much as the playing.',
      date: '2026-03-22',
      category: 'touring',
      tags: ['recording', 'studio', 'behind-the-scenes', 'temple-cabin', 'sessions'],
      readTime: '6 min read',
      content: '<p>There is a long tradition in acoustic music of recording in spaces that are, technically speaking, not studios at all. Churches, barns, living rooms, and cabins have all served as recording environments for some of the most beloved acoustic albums in history. The reason is simple: these spaces have natural acoustics that no amount of studio engineering can replicate. Wood walls, high ceilings, and the absence of sound-deadening foam create a warm, living room ambiance where the instruments breathe and resonate in ways that feel organic and real.</p>' +
        '<h2>The Space</h2>' +
        '<p>The Sam Grisman Project\'s approach to recording reflects this philosophy. Rather than booking time in a conventional studio with isolation booths and close-miking techniques, SGP favors intimate spaces where the musicians can gather in a circle, see each other, and play together in the same room. This is how acoustic music was meant to be heard. When a mandolin and a fiddle are two feet apart, their overtones blend in the air between them, creating a richness of sound that cannot be achieved when each instrument is recorded in isolation and mixed together after the fact.</p>' +
        '<p>The visual component of these sessions matters too. Filmed with careful attention to lighting and composition, the sessions capture not just the sound but the feel of the music being made. You can see the musicians listening to each other, exchanging glances when a solo takes an unexpected turn, nodding along when the groove locks in. This visual intimacy gives the viewer a seat in the room, a feeling of being present for a private musical moment that happens to have been captured on camera.</p>' +
        '<h2>The Process</h2>' +
        '<p>A typical SGP session begins with the musicians running through the material in a loose, conversational way. They discuss the arrangement, agree on the form, and decide who will take solos where. Then they play it. Often the first or second take is the keeper, because the spontaneity and energy of early takes is almost impossible to recapture after multiple repetitions. The goal is not perfection but presence, not polish but emotion.</p>' +
        '<p>The recording setup is minimal by modern standards. A handful of high-quality microphones placed at strategic positions around the room capture the natural balance of the ensemble. There is very little post-production processing. What you hear is essentially what was in the room, and that honesty is a big part of what makes these sessions resonate with listeners.</p>' +
        '<h2>Why It Works</h2>' +
        '<p>In an era of auto-tuned vocals, quantized rhythms, and layered production, there is something deeply appealing about acoustic music recorded simply and honestly. The SGP sessions offer a reminder that great music does not require technology. It requires great musicians, a good room, and the willingness to press record and trust the moment. That trust is the hallmark of the Sam Grisman Project\'s recorded output, and it is why these sessions have found such a devoted audience among listeners who value authenticity above all else.</p>'
    },

    {
      slug: 'festival-season-guide',
      title: 'Festival Season Guide: Where to See Acoustic Music Live',
      excerpt: 'From the intimate pickers\' circles of small gatherings to the main stages of major festivals, here is your guide to experiencing acoustic music in its natural habitat.',
      date: '2026-02-28',
      category: 'touring',
      tags: ['festivals', 'live-music', 'bluegrass-festivals', 'guide', 'acoustic'],
      readTime: '7 min read',
      content: '<p>There is no better way to experience acoustic music than at a festival. The combination of outdoor settings, multiple stages, camping, and the communal energy of thousands of music lovers creates an atmosphere that cannot be replicated in a club or a concert hall. Bluegrass and acoustic music festivals have a culture all their own, built around the tradition of the jam session and the belief that the best music often happens not on stage but in the campground after the official programming has ended.</p>' +
        '<h2>The Major Festivals</h2>' +
        '<p>Telluride Bluegrass Festival in Colorado is widely regarded as the crown jewel of the acoustic festival circuit. Set against the stunning backdrop of the San Juan Mountains, Telluride has been running since 1974 and consistently books a lineup that spans traditional bluegrass, progressive acoustic music, folk, and Americana. The town itself is tiny, the mountain setting is spectacular, and the music echoes off the canyon walls in a way that borders on spiritual. MerleFest in North Carolina, founded by Doc Watson in memory of his son, is another pillar of the festival world, combining deep traditional roots with a broad musical vision. Grey Fox Bluegrass Festival in New York\'s Catskill Mountains offers a more intimate experience with an emphasis on traditional and progressive bluegrass.</p>' +
        '<p>DelFest, founded by Del McCoury in Cumberland, Maryland, has quickly become one of the most beloved festivals in the scene. Its lineup bridges the gap between traditional bluegrass and the jam-grass world, making it a natural home for acts like the Sam Grisman Project that draw from both traditions. The festival\'s campground jamming is legendary, with professional-caliber musicians often joining impromptu sessions that run until sunrise.</p>' +
        '<h2>The Smaller Gatherings</h2>' +
        '<p>Some of the most rewarding acoustic music experiences happen at smaller, more intimate festivals. FloydFest in Floyd, Virginia offers a carefully curated lineup in a beautiful mountain setting. Charm City Bluegrass in Baltimore brings acoustic music to an urban environment with great success. The Freshgrass Festival at MASS MoCA in North Adams, Massachusetts combines cutting-edge acoustic music with contemporary art in a converted factory complex. These smaller events often offer better access to the musicians, more relaxed atmospheres, and the kind of serendipitous musical encounters that festival veterans live for.</p>' +
        '<p>Winter festivals provide an alternative to the traditional summer festival season. WinterWonderGrass, held in multiple locations including Steamboat Springs, Colorado and Stratton, Vermont, combines skiing and snowboarding with acoustic music in a format that has proven irresistible to outdoor enthusiasts. The intimacy of a winter festival, where the smaller crowds and cozy indoor stages create a warmth that contrasts with the snow outside, offers a completely different energy from the sprawling summer gatherings.</p>' +
        '<h2>Making the Most of Festival Season</h2>' +
        '<p>The key to a great festival experience is preparation and openness. Bring a comfortable camping setup, bring your instrument if you play, and be willing to explore beyond the headliners. Some of the best music you will ever hear happens on side stages, in workshops, and in late-night campground jams. The acoustic music festival community is remarkably welcoming to newcomers, and the shared experience of listening to great music under open skies has a way of turning strangers into friends by the end of the weekend.</p>'
    },

    /* -------------------------------------------------------
       GEAR
       ------------------------------------------------------- */
    {
      slug: 'what-makes-great-mandolin',
      title: 'What Makes a Great Mandolin?',
      excerpt: 'From the legendary Gibson F-5 to modern builders pushing the craft forward, here is what separates a good mandolin from a great one.',
      date: '2026-03-12',
      category: 'gear',
      tags: ['mandolin', 'gear', 'instruments', 'luthiers', 'gibson', 'tone'],
      readTime: '7 min read',
      content: '<p>The mandolin is a small instrument with an outsized impact on American music. In the right hands, its bright, cutting tone can carry a melody over a full band, chop out a rhythm that drives a bluegrass ensemble, or sustain a tremolo that makes audiences hold their breath. But not all mandolins are created equal, and the difference between a good mandolin and a great one is vast. Understanding what makes a mandolin exceptional requires looking at the instrument from several angles: its construction, its tonewoods, its setup, and the intangible quality that luthiers call "responsiveness."</p>' +
        '<h2>The Gibson F-5: The Gold Standard</h2>' +
        '<p>Any discussion of great mandolins begins with the Gibson F-5, specifically the instruments built under the supervision of Lloyd Loar in the early 1920s. The Loar-signed F-5 is the Stradivarius of the mandolin world, the instrument against which all others are measured. Loar redesigned the mandolin from the ground up, introducing f-holes instead of the oval sound hole, a longer neck for better intonation, and a graduated top and back that were tuned to specific resonant frequencies. The result was an instrument with extraordinary projection, clarity, and tonal complexity.</p>' +
        '<p>Original Loar F-5 mandolins are now worth hundreds of thousands of dollars and are among the most sought-after stringed instruments in existence. But their influence extends far beyond the collector market. Every serious mandolin builder working today is, in some sense, responding to the Loar F-5, either by trying to replicate its qualities or by deliberately departing from its design to explore new tonal territory. David Grisman\'s longtime instrument was a Loar F-5, and its voice defined the sound of Dawg music.</p>' +
        '<h2>Modern Builders</h2>' +
        '<p>While the Loar F-5 set the standard, modern mandolin builders have pushed the craft into new territory. Builders like Gilchrist, Nugget, and Northfield, the company associated with SGP mandolinist Joe K. Walsh, are producing instruments that rival or exceed the tonal qualities of the best vintage examples. Modern building techniques, including computer-aided design for top graduation and advanced bracing patterns, allow today\'s luthiers to achieve a level of consistency that was impossible in the factory production environment of 1920s Gibson.</p>' +
        '<p>The choice of tonewoods is critical. Spruce tops and maple backs and sides are the traditional combination, but the specific qualities of the wood matter enormously. The grain density of the spruce top, the figure and density of the maple, and the way these woods are dried and aged all contribute to the final sound. A great mandolin builder selects and matches these woods with the care of a master chef choosing ingredients, understanding that the raw materials set the ceiling for what the finished instrument can achieve.</p>' +
        '<h2>Setup and Playability</h2>' +
        '<p>Even the finest mandolin will underperform if it is not properly set up. The bridge height, string action, nut slots, fret leveling, and tailpiece angle all affect how the instrument plays and sounds. A professional setup by an experienced luthier can transform a good mandolin into a great one, and neglecting setup can make even an expensive instrument frustrating to play. The best players are meticulous about their setup, understanding that the physical interface between the player and the instrument is as important as the instrument\'s inherent tonal qualities.</p>' +
        '<p>Ultimately, what makes a mandolin great is its ability to respond to the player\'s intentions. A great mandolin amplifies the musician\'s touch, dynamics, and expression. It rewards good technique with a rich, complex tone and punishes sloppiness with immediate feedback. It becomes, in the hands of a skilled player, an extension of their musical voice. That quality of responsiveness, more than any specification or price tag, is what separates the truly great mandolins from the merely good ones.</p>'
    },

    /* -------------------------------------------------------
       CULTURE
       ------------------------------------------------------- */
    {
      slug: 'rotating-collective',
      title: 'Inside the Rotating Collective: How SGP Picks Each Lineup',
      excerpt: 'The Sam Grisman Project is not a band. It is a rotating collective of acoustic musicians. Here is how the lineup comes together for each show.',
      date: '2026-03-18',
      category: 'culture',
      tags: ['sgp', 'collective', 'lineup', 'musicians', 'collaboration'],
      readTime: '6 min read',
      content: '<p>One of the most distinctive things about the Sam Grisman Project is that it does not have a fixed lineup. Unlike a traditional band where the same four or five musicians play every show, SGP is a rotating collective. Sam Grisman is the constant, the anchor around which each configuration assembles, but the musicians who join him change from show to show, tour to tour, and recording to recording. This is not a quirk or a compromise. It is the fundamental design principle of the project.</p>' +
        '<h2>The Philosophy</h2>' +
        '<p>The rotating collective model serves the music in ways that a fixed lineup cannot. Every combination of musicians brings a different energy, a different set of influences, and a different chemistry to the stage. A show with two fiddles and a banjo will sound dramatically different from a show with a mandolin and a cello, even if the song list is identical. By changing the lineup, Sam ensures that the music never becomes routine, that every performance has an element of discovery, and that the audience is always hearing something they have not heard before.</p>' +
        '<p>This approach has deep roots in the tradition that SGP draws from. Jazz has always operated on a similar principle, with musicians forming ad hoc groups for specific recordings and engagements. The jam band world embraces sit-ins and collaborations as a core part of the culture. And the picking circles of bluegrass festivals, where musicians of varying backgrounds come together to play, are the purest expression of the idea that great music happens when talented people listen to each other and respond in real time.</p>' +
        '<h2>How It Comes Together</h2>' +
        '<p>Assembling each SGP lineup is a combination of practical logistics and musical intuition. Availability is the starting point. The musicians in SGP\'s orbit are all in high demand, touring with their own projects and collaborating with other artists. Sam works around these schedules, identifying windows when the right combination of players can come together. Beyond availability, he considers the musical balance of each configuration. Does the lineup have enough rhythmic drive? Is there a strong melodic voice? Will these particular musicians spark off each other in interesting ways?</p>' +
        '<p>The rehearsal process for a rotating ensemble is necessarily different from that of a fixed band. With a traditional band, you can build arrangements over months and years, developing a collective vocabulary through repetition. With SGP, the musicians must be able to come together, agree on a set list, run through the material, and deliver a compelling performance with minimal preparation. This is only possible because every musician in the collective is operating at an elite level. They can hear a tune once, understand its structure, and contribute meaningfully from the first pass.</p>' +
        '<h2>The Result</h2>' +
        '<p>The magic of the rotating collective is that it keeps everyone on their toes. There is no autopilot. Every musician is listening intently, reacting in real time, and drawing on the full depth of their musicianship to serve the moment. The result is music that feels alive and spontaneous in a way that heavily rehearsed performances rarely achieve. For the audience, seeing SGP is an experience that is different every time, a living, breathing expression of acoustic music\'s infinite possibilities.</p>'
    },

    {
      slug: 'mill-valley-to-nashville',
      title: 'Mill Valley to Nashville: Sam Grisman\'s Journey',
      excerpt: 'From growing up in the musical household of a legend to leading his own project in Nashville, the story of how Sam Grisman found his own voice.',
      date: '2026-03-08',
      category: 'culture',
      tags: ['sam-grisman', 'nashville', 'mill-valley', 'biography', 'journey'],
      readTime: '6 min read',
      content: '<p>Growing up as the child of a musical legend is both a gift and a challenge. The gift is obvious: Sam Grisman was exposed to the highest levels of acoustic musicianship from birth, with some of the greatest players in the world passing through his family\'s home in Mill Valley, California on a regular basis. The challenge is subtler but no less real. When your father has essentially invented a genre and your childhood memories include Jerry Garcia sitting in your living room picking old-time tunes, how do you find your own musical identity?</p>' +
        '<h2>Mill Valley</h2>' +
        '<p>Mill Valley in the 1990s was an extraordinary place to grow up if you were interested in acoustic music. Nestled in the hills of Marin County, just north of San Francisco, it had been home to a vibrant musical community since the 1960s. David Grisman\'s studio was a magnet for musicians from around the world, and the informal sessions that took place there were legendary. For young Sam, this was simply home. The mandolin runs that filled the house, the late-night picking sessions, the parade of world-class musicians who dropped by to play were not extraordinary events. They were the texture of daily life.</p>' +
        '<p>Sam gravitated to the upright bass, an instrument choice that says something about his temperament. The bass is the supporting player, the foundation builder, the one who makes everyone else sound good. It is not the instrument of someone seeking the spotlight. It is the instrument of someone who understands that the deepest satisfaction in music comes from locking in with other players and making the whole greater than the sum of its parts.</p>' +
        '<h2>Finding His Own Path</h2>' +
        '<p>Rather than trading on his family name, Sam spent years paying his dues as a sideman, touring with various projects and absorbing the vocabularies of bluegrass, folk, jazz, and jam music. This period was essential. It allowed him to develop his own voice on the instrument, build his own network of musical relationships, and earn the respect of the acoustic music community on his own merits. By the time he launched the Sam Grisman Project, he had the skills, the connections, and the artistic vision to lead a group that could honor his family\'s legacy while charting its own course.</p>' +
        '<p>The move to Nashville was a pivotal decision. Nashville\'s acoustic music scene is unmatched in its depth and diversity, with a concentration of talent that makes spontaneous collaboration not just possible but inevitable. For a project built on the rotating collective model, Nashville is the ideal home base. The city\'s musicians are accustomed to working in fluid configurations, and the culture of mutual respect and musical generosity that defines the Nashville scene aligns perfectly with SGP\'s philosophy.</p>' +
        '<h2>The Sam Grisman Project</h2>' +
        '<p>Today, the Sam Grisman Project stands as a bridge between the acoustic music traditions that David Grisman and Jerry Garcia helped to shape and the new generation of musicians who are carrying those traditions forward. Sam\'s journey from Mill Valley to Nashville, from the kid listening in the corner to the bandleader calling the tunes, is a story about finding your own voice while honoring the voices that came before. It is a story that resonates because it is, at its heart, the story of every musician who grows up loving the music and decides to make it their life\'s work.</p>'
    },

    {
      slug: 'art-of-jam-session',
      title: 'The Art of the Jam Session',
      excerpt: 'Jam sessions are the beating heart of acoustic music culture. Understanding their unwritten rules and etiquette is essential for every picker.',
      date: '2026-02-25',
      category: 'culture',
      tags: ['jam-session', 'etiquette', 'picking-circle', 'bluegrass', 'community'],
      readTime: '6 min read',
      content: '<p>Long before there were festivals, concert halls, or recording studios, there were jam sessions. Musicians gathering in a circle, taking turns calling tunes, trading solos, and sharing the joy of making music together. The jam session is the oldest and most fundamental form of musical collaboration, and in the world of bluegrass and acoustic music, it remains the primary way that musicians learn, connect, and grow. Every great acoustic musician, from Bill Monroe to Sam Grisman, was shaped by the jam circle.</p>' +
        '<h2>The Unwritten Rules</h2>' +
        '<p>A bluegrass jam session operates by a set of unwritten rules that every participant is expected to understand. The person who calls the tune sets the key and the tempo. Solos rotate around the circle, typically moving to the left. Each player takes one turn through the form of the song, usually one verse or one chorus, before passing the solo to the next person. The rhythm players, those not soloing, are expected to provide solid backup at a volume that supports the soloist without overpowering them. And crucially, you only join a jam at a level that matches your ability. A slow jam is not the place for showing off, and an advanced jam is not the place for learning basic chord changes.</p>' +
        '<p>Listening is the most important skill in a jam session, more important than speed, more important than flashy technique, more important than repertoire. The best jam session players are the ones who hear what everyone else is doing and find ways to complement it. If the soloist is playing high on the neck, a good rhythm player might drop to a lower voicing. If the banjo is driving hard, the guitarist might back off and play more subtly. This kind of collective awareness is what turns a group of individuals into a musical unit.</p>' +
        '<h2>Campground Jams</h2>' +
        '<p>The campground jam is a unique and beloved institution of the bluegrass festival world. After the main stages shut down for the night, the real music begins. Fires are lit, chairs are arranged in circles, and musicians of every level gather to play until the sun comes up. These campground jams are where reputations are made, where musical friendships are forged, and where the tradition is passed from one generation to the next. It is not uncommon for professional touring musicians to show up at a campground jam and play alongside amateurs, creating the kind of cross-pollination that keeps the music alive and evolving.</p>' +
        '<p>For festival newcomers, the campground jam can be intimidating. The key is to start by listening. Find a jam that matches your level, stand outside the circle, and listen to how the session flows. When you feel ready, ask if you can join. Bring your instrument, bring a positive attitude, and be willing to play rhythm more than you solo. The bluegrass community is remarkably welcoming to earnest newcomers, and the campground jam is the best classroom in the world for learning acoustic music.</p>' +
        '<h2>The SGP Connection</h2>' +
        '<p>The Sam Grisman Project is, in many ways, a formalized version of the jam session. The rotating collective model means that every SGP performance has the spontaneity and interactive energy of a great jam circle, elevated by the extraordinary skill of the participants. Sam Grisman grew up watching jam sessions happen in his living room between musicians whose names appear on the most important acoustic records ever made. That experience informs everything about how SGP operates: the emphasis on listening, the fluid exchange of ideas, the willingness to follow the music wherever it wants to go.</p>'
    }
  ];


  /* =========================================================
     GLOSSARY TERMS
     ========================================================= */
  var GLOSSARY = [

    /* -------------------------------------------------------
       INSTRUMENTS
       ------------------------------------------------------- */
    {
      term: 'Mandolin',
      slug: 'mandolin',
      definition: 'A small, eight-stringed instrument tuned in pairs (courses) to the same intervals as a violin: G-D-A-E. The mandolin is central to bluegrass and Dawg music, used for both melody and rhythmic chop. Its bright, cutting tone allows it to project over a full acoustic ensemble.',
      category: 'instruments'
    },
    {
      term: 'Upright Bass',
      slug: 'upright-bass',
      definition: 'Also called the double bass or string bass, the largest bowed string instrument. In bluegrass and acoustic music it is almost always played pizzicato (plucked). The upright bass provides the rhythmic pulse and harmonic foundation of the ensemble, typically outlining root and fifth patterns.',
      category: 'instruments'
    },
    {
      term: 'Dobro',
      slug: 'dobro',
      definition: 'A resonator guitar played horizontally on the lap using a metal slide bar. The Dobro produces a distinctive, singing tone created by its spun aluminum resonator cone. It is a staple of bluegrass and country music, often used for melodic fills and solos between vocal lines.',
      category: 'instruments'
    },
    {
      term: 'Clawhammer Banjo',
      slug: 'clawhammer-banjo',
      definition: 'A banjo playing technique in which the player strikes the strings with a downward motion using the back of the fingernail, while the thumb catches the short fifth string on the upbeat. Clawhammer predates three-finger picking and is the primary technique of old-time music. It produces a rhythmic, percussive sound distinct from Scruggs-style picking.',
      category: 'instruments'
    },
    {
      term: 'Fiddle',
      slug: 'fiddle',
      definition: 'Physically identical to a violin, the term fiddle refers to the instrument when played in folk, bluegrass, country, or old-time styles. Fiddle playing emphasizes rhythmic bowing, double stops, slides, and ornamentation that differ from classical violin technique. The fiddle is one of the oldest melody instruments in American string band music.',
      category: 'instruments'
    },
    {
      term: 'Octave Mandolin',
      slug: 'octave-mandolin',
      definition: 'A mandolin-family instrument tuned one octave below the standard mandolin (G-D-A-E, same as a violin but an octave lower). Its larger body and longer scale length produce a deeper, warmer tone. The octave mandolin is used for rhythmic accompaniment and melody in Celtic, folk, and Dawg music settings.',
      category: 'instruments'
    },
    {
      term: 'Flatpick Guitar',
      slug: 'flatpick-guitar',
      definition: 'An acoustic guitar played with a flat plectrum (pick) rather than fingerpicked. Flatpicking is the dominant guitar style in bluegrass, producing a loud, driving tone suitable for lead melodies and powerful rhythm. Players like Tony Rice and Doc Watson elevated flatpicking to a virtuosic art form.',
      category: 'instruments'
    },
    {
      term: 'Resonator Guitar',
      slug: 'resonator-guitar',
      definition: 'A guitar that uses one or more spun metal cones (resonators) instead of a wooden soundboard to amplify the sound. Resonator guitars come in two main styles: the round-neck (played upright like a standard guitar) and the square-neck (played on the lap with a slide bar, also called a Dobro). They were originally designed to be louder than conventional guitars before amplification was widely available.',
      category: 'instruments'
    },
    {
      term: 'Five-String Banjo',
      slug: 'five-string-banjo',
      definition: 'The standard banjo used in bluegrass and old-time music, featuring four long strings and a shorter fifth string (the drone string) that begins at the fifth fret. The fifth string is a defining characteristic of the instrument, providing the ringing drone tone that gives the banjo its distinctive sound. It can be played in Scruggs style (three-finger picking) or clawhammer style.',
      category: 'instruments'
    },
    {
      term: 'Cello',
      slug: 'cello',
      definition: 'A large bowed string instrument pitched between the viola and the double bass. While traditionally a classical instrument, the cello has found a growing role in acoustic and roots music, providing a rich low-end voice and lyrical melodies. Players like Nat Smith have expanded the cello\'s role through looping, effects, and extended techniques.',
      category: 'instruments'
    },

    /* -------------------------------------------------------
       TECHNIQUES
       ------------------------------------------------------- */
    {
      term: 'Chop',
      slug: 'chop',
      definition: 'A percussive mandolin technique where the player strikes a chord with a sharp, muted attack on the offbeat (beats 2 and 4). The chop provides the rhythmic backbeat in a bluegrass band, functioning similarly to a snare drum in a drum kit. A good chop is essential for any mandolin player who wants to be a strong rhythm player.',
      category: 'techniques'
    },
    {
      term: 'Cross-Picking',
      slug: 'cross-picking',
      definition: 'A flatpicking guitar technique that uses a specific pick direction pattern across three or more strings to produce a flowing, arpeggiated sound similar to banjo rolls. Cross-picking allows guitar players to create rolling, syncopated patterns that weave melody and harmony together. It requires precise right-hand control and is considered one of the more advanced flatpicking techniques.',
      category: 'techniques'
    },
    {
      term: 'Tremolo',
      slug: 'tremolo',
      definition: 'A technique in which a single note is rapidly and continuously picked to create a sustained, singing tone. On the mandolin, tremolo is achieved by rapidly alternating pick strokes and is used to sustain notes and create lyrical melodic passages. It is one of the most expressive techniques available to mandolin players and is a signature sound of Dawg music and Italian mandolin traditions.',
      category: 'techniques'
    },
    {
      term: 'Double Stop',
      slug: 'double-stop',
      definition: 'Playing two notes simultaneously on a bowed or plucked string instrument. In fiddle music, double stops are used to add harmonic richness and create a fuller sound. Common double stop intervals in bluegrass include thirds and sixths. The technique is essential for creating the characteristic two-part harmony sound of old-time and bluegrass fiddling.',
      category: 'techniques'
    },
    {
      term: 'Hammer-On',
      slug: 'hammer-on',
      definition: 'A fretting-hand technique where a finger is forcefully pressed onto a string to sound a note without picking. The first note is picked normally, then a higher note is sounded by hammering a finger onto the fretboard. Hammer-ons are fundamental ornaments in bluegrass, used to add speed, fluidity, and legato phrasing to melodic lines.',
      category: 'techniques'
    },
    {
      term: 'Pull-Off',
      slug: 'pull-off',
      definition: 'The reverse of a hammer-on: a fretting finger is pulled away from the string with a slight sideways motion to sound a lower note without picking. Pull-offs and hammer-ons are often combined in rapid succession to create fluid, legato passages. Together they form the foundation of many bluegrass licks and ornamental patterns.',
      category: 'techniques'
    },
    {
      term: 'Slide',
      slug: 'slide',
      definition: 'A technique where a fretting finger moves along the string from one fret to another while maintaining pressure, creating a smooth, gliding transition between notes. Slides are used as expressive ornaments in virtually all styles of acoustic music, adding a vocal quality to instrumental lines. In Dobro and lap steel playing, the slide bar itself is the primary means of note articulation.',
      category: 'techniques'
    },
    {
      term: 'Drone',
      slug: 'drone',
      definition: 'A sustained or continuously sounded note, typically the root or fifth of the key, that provides a harmonic foundation beneath a melody. The fifth string of the banjo acts as a natural drone. Old-time fiddle music makes extensive use of drone strings, and the drone aesthetic is a defining characteristic of mountain music and modal playing.',
      category: 'techniques'
    },
    {
      term: 'Flatpicking',
      slug: 'flatpicking',
      definition: 'A guitar technique using a flat pick (plectrum) to play single-note melody lines and rhythmic strumming on an acoustic guitar. In bluegrass, flatpicking is the dominant guitar style, producing the volume and clarity needed to be heard in an unamplified ensemble. Players like Doc Watson and Tony Rice defined the art of bluegrass flatpicking.',
      category: 'techniques'
    },
    {
      term: 'Fingerpicking',
      slug: 'fingerpicking',
      definition: 'A guitar technique where individual strings are plucked with the fingertips or fingernails rather than a flat pick. Fingerpicking allows the player to simultaneously play bass lines, melodies, and harmonies. While less common in bluegrass than flatpicking, fingerpicking is essential in folk, ragtime, and country blues guitar styles.',
      category: 'techniques'
    },
    {
      term: 'Tremolo Picking',
      slug: 'tremolo-picking',
      definition: 'Rapid, continuous alternate picking on a single string or course of strings to create a sustained, shimmering tone. On the mandolin, tremolo picking is the primary method of sustaining notes, since the instrument\'s short sustain means individual notes decay quickly. Mastering even, controlled tremolo is considered a milestone for mandolin players.',
      category: 'techniques'
    },
    {
      term: 'Scruggs Style',
      slug: 'scruggs-style',
      definition: 'A three-finger banjo picking technique developed by Earl Scruggs in the 1940s that became the defining sound of bluegrass banjo. It uses the thumb, index, and middle fingers wearing metal fingerpicks to play rapid, syncopated roll patterns across the strings. Scruggs style transformed the banjo from a rhythm instrument into a lead instrument capable of dazzling speed and melodic complexity.',
      category: 'techniques'
    },

    /* -------------------------------------------------------
       GENRES
       ------------------------------------------------------- */
    {
      term: 'Bluegrass',
      slug: 'bluegrass',
      definition: 'An American roots music genre that originated in the 1940s, named after Bill Monroe\'s band, the Blue Grass Boys. Characterized by acoustic string instruments (mandolin, banjo, fiddle, guitar, bass), fast tempos, improvised solos, and tight vocal harmonies. Bluegrass draws from Appalachian folk music, blues, jazz, and gospel traditions.',
      category: 'genres'
    },
    {
      term: 'Dawg Music',
      slug: 'dawg-music',
      definition: 'A genre created by mandolinist David "Dawg" Grisman that fuses bluegrass, jazz, swing, Latin, and world music into an instrumental acoustic style. Named after Grisman\'s nickname, Dawg music features the instrumentation of bluegrass but the harmonic language and improvisational approach of jazz. The David Grisman Quintet was the primary vehicle for this genre.',
      category: 'genres'
    },
    {
      term: 'Newgrass',
      slug: 'newgrass',
      definition: 'A progressive offshoot of bluegrass that emerged in the 1970s, incorporating elements of rock, jazz, and other genres into the acoustic bluegrass format. The New Grass Revival, led by Sam Bush, was the genre\'s most influential band. Newgrass retains bluegrass instrumentation but expands the repertoire, harmonic vocabulary, and improvisational freedom beyond traditional boundaries.',
      category: 'genres'
    },
    {
      term: 'Old-Time',
      slug: 'old-time',
      definition: 'The folk music tradition of the Appalachian region that predates and gave rise to bluegrass. Old-time music features fiddle, clawhammer banjo, and guitar in ensemble playing where all instruments play the melody or rhythmic accompaniment simultaneously, rather than taking individual solos. It is dance music at its core, with roots in English, Scottish, Irish, and African American musical traditions.',
      category: 'genres'
    },
    {
      term: 'Americana',
      slug: 'americana',
      definition: 'A broad musical category that encompasses roots-oriented music drawing from country, folk, bluegrass, R&B, gospel, and blues traditions. Americana is more of an umbrella term than a genre, uniting artists who work within or across American roots traditions. The Americana Music Association and its annual awards have helped define and promote the category since 1999.',
      category: 'genres'
    },
    {
      term: 'Jam-Grass',
      slug: 'jam-grass',
      definition: 'A subgenre blending bluegrass instrumentation with the extended improvisation and open-ended song structures of jam band music. Jam-grass bands like Yonder Mountain String Band and Greensky Bluegrass play acoustic instruments but stretch songs into extended improvisational passages. The Sam Grisman Project draws from jam-grass traditions in its live performances.',
      category: 'genres'
    },
    {
      term: 'Western Swing',
      slug: 'western-swing',
      definition: 'A genre that originated in Texas in the 1920s and 1930s, blending country music with jazz, blues, and big band swing. Pioneered by Bob Wills and his Texas Playboys, Western Swing featured fiddles, steel guitar, and jazz-style improvisation over dance rhythms. Its jazz influence connects it to Dawg music and other fusion styles.',
      category: 'genres'
    },
    {
      term: 'Progressive Bluegrass',
      slug: 'progressive-bluegrass',
      definition: 'A modern evolution of bluegrass that incorporates classical composition, jazz harmony, and experimental song structures while maintaining acoustic instrumentation. Punch Brothers are the most prominent example, bringing conservatory-level musicianship to the bluegrass format. Progressive bluegrass pushes the technical and compositional boundaries of the genre while respecting its roots.',
      category: 'genres'
    },

    /* -------------------------------------------------------
       THEORY
       ------------------------------------------------------- */
    {
      term: 'Nashville Number System',
      slug: 'nashville-number-system',
      definition: 'A method of notating music using numbers to represent chords relative to the key, rather than specific note names. In the Nashville Number System, a "1" is always the root chord, a "4" is the fourth, and a "5" is the fifth, regardless of the key. This allows musicians to transpose songs instantly and is the standard communication method among Nashville session players.',
      category: 'theory'
    },
    {
      term: 'Standard Tuning',
      slug: 'standard-tuning',
      definition: 'The conventional tuning for a six-string guitar: E-A-D-G-B-E from lowest to highest string. Standard tuning provides a balance of open chord voicings, comfortable scale patterns, and reasonable access to all keys. Most bluegrass and acoustic music is played in standard tuning, sometimes with a capo to change the key while maintaining familiar chord shapes.',
      category: 'theory'
    },
    {
      term: 'Modal Playing',
      slug: 'modal-playing',
      definition: 'An approach to melody and improvisation based on modes (scales derived from different starting points of the major scale) rather than conventional major and minor keys. Old-time fiddle tunes frequently use the Mixolydian and Dorian modes, giving them a distinctive sound that is neither fully major nor minor. Modal playing is a fundamental element of Appalachian and Celtic music traditions.',
      category: 'theory'
    },
    {
      term: 'Mixolydian Mode',
      slug: 'mixolydian-mode',
      definition: 'A musical scale identical to the major scale except with a lowered seventh degree. In the key of G, Mixolydian uses an F natural instead of F sharp, creating a slightly bluesy, ambiguous quality. The Mixolydian mode is extremely common in bluegrass, old-time, and folk music, and many well-known fiddle tunes are Mixolydian rather than purely major.',
      category: 'theory'
    },
    {
      term: 'Key of G',
      slug: 'key-of-g',
      definition: 'The most common key in bluegrass music, favored because it accommodates the open strings of the guitar (G, D), mandolin (G, D), and banjo (open G tuning). Playing in the key of G allows acoustic instruments to ring with their natural resonance, producing a full, rich sound. A large percentage of the bluegrass standard repertoire is in G or closely related keys.',
      category: 'theory'
    },
    {
      term: 'Capo',
      slug: 'capo',
      definition: 'A clamp placed across the guitar or banjo neck to raise the pitch of all strings by a uniform interval. A capo allows the player to use familiar open-position chord shapes in higher keys. In bluegrass, guitarists commonly capo up to play in keys like A, B, or Bb while using comfortable G or C chord shapes. Banjo players use capos extensively to match different vocal keys.',
      category: 'theory'
    },
    {
      term: 'Open Tuning',
      slug: 'open-tuning',
      definition: 'Any guitar or banjo tuning in which the open (unfretted) strings form a complete chord. Open G tuning (G-D-G-B-D) is the standard tuning for the five-string banjo and is also popular with slide guitar players. Open tunings provide rich, resonant chord voicings and are fundamental to both old-time banjo playing and many folk guitar styles.',
      category: 'theory'
    },

    /* -------------------------------------------------------
       CULTURE
       ------------------------------------------------------- */
    {
      term: 'Picking Circle',
      slug: 'picking-circle',
      definition: 'An informal gathering of musicians sitting or standing in a circle, taking turns playing songs and trading solos. The picking circle is the fundamental social unit of acoustic music, where tunes are shared, skills are developed, and musical friendships are formed. Festival campgrounds, front porches, and parking lots are all common picking circle locations.',
      category: 'culture'
    },
    {
      term: 'Jam Session',
      slug: 'jam-session',
      definition: 'An informal musical gathering where musicians play together spontaneously, typically without rehearsal or a predetermined set list. In bluegrass, jam sessions follow established conventions for calling tunes, taking solos, and providing backup. Jam sessions are the primary social activity of the bluegrass community and the traditional method by which the music is learned and transmitted.',
      category: 'culture'
    },
    {
      term: 'Breakdown',
      slug: 'breakdown',
      definition: 'A fast, instrumental bluegrass tune, typically in 4/4 time, built around a repeating melody that serves as a vehicle for virtuosic solos by each instrument in turn. Breakdowns like "Foggy Mountain Breakdown" and "Blackberry Blossom" are cornerstones of the bluegrass repertoire and showcase the genre\'s emphasis on speed, precision, and improvisational skill.',
      category: 'culture'
    },
    {
      term: 'Old & In The Way',
      slug: 'old-and-in-the-way',
      definition: 'A bluegrass supergroup formed in 1973 featuring Jerry Garcia on banjo, David Grisman on mandolin, Peter Rowan on guitar and vocals, Vassar Clements on fiddle, and John Kahn on bass. Despite their brief existence, their live recordings became among the best-selling bluegrass albums of all time and introduced countless rock fans to acoustic music.',
      category: 'culture'
    },
    {
      term: 'IBMA',
      slug: 'ibma',
      definition: 'The International Bluegrass Music Association, the professional trade organization for the bluegrass music industry. Founded in 1985, the IBMA hosts the annual World of Bluegrass conference and the International Bluegrass Music Awards, the genre\'s most prestigious honors. The organization supports the bluegrass community through education, advocacy, and professional development.',
      category: 'culture'
    },
    {
      term: 'Flatpicking Championship',
      slug: 'flatpicking-championship',
      definition: 'The National Flatpicking Championship, held annually in Winfield, Kansas as part of the Walnut Valley Festival. It is the most prestigious acoustic guitar competition in the world, attracting top flatpickers from across the globe. Winners receive a custom guitar and join an elite roster of champions that includes many of the greatest acoustic guitarists in history.',
      category: 'culture'
    },
    {
      term: 'High Lonesome Sound',
      slug: 'high-lonesome-sound',
      definition: 'A term describing the emotionally intense, high-pitched vocal style characteristic of traditional bluegrass singing. Rooted in the mountain singing traditions of Appalachia, the high lonesome sound conveys a raw, keening quality that can sound simultaneously mournful and ecstatic. Bill Monroe\'s tenor voice is the archetypal example of the style.',
      category: 'culture'
    },
    {
      term: 'Bluegrass Gospel',
      slug: 'bluegrass-gospel',
      definition: 'Sacred music performed in the bluegrass style, featuring tight vocal harmonies, acoustic instrumentation, and themes of faith, redemption, and salvation. Gospel songs have been part of bluegrass from its inception, with Bill Monroe and the Stanley Brothers both recording extensively in the genre. Bluegrass gospel remains one of the most popular and emotionally powerful subsets of the music.',
      category: 'culture'
    },
    {
      term: 'Parking Lot Picking',
      slug: 'parking-lot-picking',
      definition: 'The tradition of informal jam sessions that take place in the parking lots and campgrounds surrounding bluegrass festivals and concerts. Parking lot picking is considered by many to be the soul of the bluegrass community, where the music is shared freely and the barriers between performers and audience dissolve. Some of the most memorable musical moments in bluegrass history have happened in parking lots.',
      category: 'culture'
    },
    {
      term: 'Lick',
      slug: 'lick',
      definition: 'A short musical phrase or pattern that a player uses as part of their improvisational vocabulary. Licks are the building blocks of bluegrass solos, learned from recordings, jam sessions, and other players. Every instrumentalist develops a personal collection of licks that they combine, vary, and deploy in different musical contexts. Learning the classic licks of the genre is a fundamental part of becoming a fluent bluegrass musician.',
      category: 'culture'
    },
    {
      term: 'Kickoff',
      slug: 'kickoff',
      definition: 'A short instrumental introduction played before the first verse of a bluegrass song, typically four to eight bars long. The kickoff establishes the key, tempo, and feel of the song and is usually played by the lead instrument. A good kickoff tells the band and the audience exactly what song is coming and sets the energy for the entire performance.',
      category: 'culture'
    },
    {
      term: 'Tag',
      slug: 'tag',
      definition: 'A brief musical ending added after the last chorus or verse of a song. In bluegrass, the tag is typically a two-to-four-bar phrase that brings the song to a definitive close. Tags often involve the whole band playing a unison rhythmic figure or a cascading run that signals the final resolution. A clean, tight tag is the mark of a well-rehearsed ensemble.',
      category: 'culture'
    }
  ];


  /* =========================================================
     HELPER UTILITIES
     ========================================================= */

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* =========================================================
     PUBLIC API
     ========================================================= */

  function getMusicians() {
    return MUSICIANS;
  }

  function getMusicianBySlug(slug) {
    for (var i = 0; i < MUSICIANS.length; i++) {
      if (MUSICIANS[i].slug === slug) return MUSICIANS[i];
    }
    return null;
  }

  function getPosts() {
    return BLOG_POSTS;
  }

  function getPostBySlug(slug) {
    for (var i = 0; i < BLOG_POSTS.length; i++) {
      if (BLOG_POSTS[i].slug === slug) return BLOG_POSTS[i];
    }
    return null;
  }

  function getGlossaryTerms() {
    return GLOSSARY;
  }

  function getTermBySlug(slug) {
    for (var i = 0; i < GLOSSARY.length; i++) {
      if (GLOSSARY[i].slug === slug) return GLOSSARY[i];
    }
    return null;
  }

  /**
   * Auto-link the first occurrence of each glossary term in an HTML string.
   * Wraps matched terms in a <span> with a tooltip showing the definition.
   * Only matches terms that are not already inside an HTML tag.
   */
  function linkGlossaryTerms(htmlStr) {
    var linked = {};
    var result = htmlStr;

    for (var i = 0; i < GLOSSARY.length; i++) {
      var term = GLOSSARY[i];
      if (linked[term.slug]) continue;

      var escaped = escapeRegex(term.term);
      var regex = new RegExp('(?<![<\\/\\w])\\b(' + escaped + ')\\b(?![\\w>])', 'i');

      if (regex.test(result)) {
        result = result.replace(regex,
          '<span class="glossary-term" data-term="' + term.slug +
          '" title="' + escapeHtml(term.definition) + '">$1</span>'
        );
        linked[term.slug] = true;
      }
    }

    return result;
  }

  /* =========================================================
     EXPOSE AS WINDOW GLOBALS
     ========================================================= */
  window.SGP_MUSICIANS = MUSICIANS;
  window.SGP_BLOG_POSTS = BLOG_POSTS;
  window.SGP_GLOSSARY_TERMS = GLOSSARY;

  window.SGPData = {
    getMusicians: getMusicians,
    getMusicianBySlug: getMusicianBySlug,
    getPosts: getPosts,
    getPostBySlug: getPostBySlug,
    getGlossaryTerms: getGlossaryTerms,
    getTermBySlug: getTermBySlug,
    linkGlossaryTerms: linkGlossaryTerms
  };

})();
