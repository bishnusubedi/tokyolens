import bcryptjs from 'bcryptjs'
const { hash } = bcryptjs
import { prisma } from '../src/index.js'

// picsum gives stable, real-looking photos by seed name
const img = (seed: string, w = 800, h = 1000) => `https://picsum.photos/seed/${seed}/${w}/${h}`
const thumb = (seed: string) => img(seed, 400, 500)

async function main() {
  console.log('Seeding database...')

  // ── Forum categories ────────────────────────────────────────────────────────
  const categories = [
    { slug: 'EQUIPMENT_REVIEWS', name: 'Equipment Reviews', description: 'Cameras, lenses, and gear discussion', sortOrder: 0 },
    { slug: 'TOKYO_PHOTO_SPOTS', name: 'Tokyo Photo Spots', description: 'Discover the best shooting locations in Tokyo', sortOrder: 1 },
    { slug: 'CRITIQUE_MY_WORK', name: 'Critique My Work', description: 'Share your photos and get constructive feedback', sortOrder: 2 },
    { slug: 'GENERAL', name: 'General Discussion', description: 'Photography talk and community chat', sortOrder: 3 },
  ]
  for (const cat of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug as any },
      update: {},
      create: cat as any,
    })
  }

  // ── Users ───────────────────────────────────────────────────────────────────
  const pw = await hash('demo123456', 12)
  const adminPw = await hash('admin123456', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tokyolens.jp' },
    update: { password: adminPw },
    create: {
      email: 'admin@tokyolens.jp', username: 'admin', name: 'Tokyo Lens Admin',
      password: adminPw, role: 'ADMIN', bio: 'Platform administrator',
    },
  })

  const sakura = await prisma.user.upsert({
    where: { email: 'demo@tokyolens.jp' },
    update: { password: pw },
    create: {
      email: 'demo@tokyolens.jp', username: 'sakura_shots', name: 'Sakura Yamamoto',
      password: pw, role: 'USER',
      bio: 'Street photographer based in Shinjuku. Capturing Tokyo one frame at a time.',
      location: 'Shinjuku, Tokyo', instagramUrl: 'sakura_shots',
    },
  })

  const kenji = await prisma.user.upsert({
    where: { email: 'kenji@tokyolens.jp' },
    update: { password: pw },
    create: {
      email: 'kenji@tokyolens.jp', username: 'kenji_frames', name: 'Kenji Nakamura',
      password: pw, role: 'USER',
      bio: 'Architectural and night photographer. Sony A7 IV shooter.',
      location: 'Shibuya, Tokyo', instagramUrl: 'kenji_frames',
    },
  })

  const yuki = await prisma.user.upsert({
    where: { email: 'yuki@tokyolens.jp' },
    update: { password: pw },
    create: {
      email: 'yuki@tokyolens.jp', username: 'yuki_lens', name: 'Yuki Tanaka',
      password: pw, role: 'USER',
      bio: 'Portrait & macro. Finding beauty in small things across Tokyo.',
      location: 'Harajuku, Tokyo',
    },
  })

  const hiro = await prisma.user.upsert({
    where: { email: 'hiro@tokyolens.jp' },
    update: { password: pw },
    create: {
      email: 'hiro@tokyolens.jp', username: 'hiro_snap', name: 'Hiro Suzuki',
      password: pw, role: 'USER',
      bio: 'Travel and landscape photographer. Fujifilm X-T5 user.',
      location: 'Asakusa, Tokyo', instagramUrl: 'hiro_snap',
    },
  })

  const luna = await prisma.user.upsert({
    where: { email: 'luna@tokyolens.jp' },
    update: { password: pw },
    create: {
      email: 'luna@tokyolens.jp', username: 'luna_tokyo', name: 'Luna Park',
      password: pw, role: 'USER',
      bio: 'Wildlife and abstract. Nikon Z8. Chasing the unexpected.',
      location: 'Ueno, Tokyo',
    },
  })

  const users = [sakura, kenji, yuki, hiro, luna, admin]

  // ── Photos ──────────────────────────────────────────────────────────────────
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000)

  const photoData = [
    // Sakura — Street
    { title: 'Shinjuku Rain at Midnight', seed: 'tokyo-street-1', w: 800, h: 1067, neighborhood: 'Shinjuku', category: 'STREET', author: sakura, desc: 'The neon reflections on wet asphalt never get old.', days: 1, votes: 42 },
    { title: 'Golden Gai Alley', seed: 'tokyo-street-2', w: 800, h: 600, neighborhood: 'Shinjuku', category: 'STREET', author: sakura, desc: 'A narrow slice of old Tokyo still breathing.', days: 5, votes: 38 },
    { title: 'Shibuya Scramble Dusk', seed: 'tokyo-street-3', w: 800, h: 534, neighborhood: 'Shibuya', category: 'STREET', author: sakura, desc: '3000 people crossing at once. Every time.', days: 10, votes: 61 },
    { title: 'Yanaka Ghost Town', seed: 'tokyo-street-4', w: 800, h: 1200, neighborhood: 'Yanaka', category: 'STREET', author: sakura, desc: 'The last neighborhood that feels untouched.', days: 18, votes: 27 },

    // Kenji — Architecture + Night
    { title: 'Tokyo Skytree Blue Hour', seed: 'tokyo-arch-1', w: 800, h: 1067, neighborhood: 'Asakusa', category: 'ARCHITECTURE', author: kenji, desc: 'The 30-second window before the magic fades.', days: 2, votes: 55 },
    { title: 'Roppongi Hills Glass', seed: 'tokyo-arch-2', w: 800, h: 600, neighborhood: 'Roppongi', category: 'ARCHITECTURE', author: kenji, desc: 'Reflected city in the tower facade.', days: 7, votes: 33 },
    { title: 'Shinjuku Neons', seed: 'tokyo-night-1', w: 800, h: 1200, neighborhood: 'Shinjuku', category: 'NIGHT', author: kenji, desc: 'ISO 3200, f/1.8. Hand-held and hoping.', days: 12, votes: 72 },
    { title: 'Odaiba Rainbow Bridge', seed: 'tokyo-night-2', w: 800, h: 534, neighborhood: 'Odaiba', category: 'NIGHT', author: kenji, desc: '20-second exposure from the waterfront.', days: 20, votes: 48 },

    // Yuki — Portrait + Macro
    { title: 'Tea Ceremony Light', seed: 'tokyo-portrait-1', w: 800, h: 1000, neighborhood: 'Harajuku', category: 'PORTRAIT', author: yuki, desc: 'Window light. No flash. Just patience.', days: 3, votes: 44 },
    { title: 'Harajuku Cosplay', seed: 'tokyo-portrait-2', w: 800, h: 1067, neighborhood: 'Harajuku', category: 'PORTRAIT', author: yuki, desc: 'She said yes to one shot. This was it.', days: 8, votes: 58 },
    { title: 'Cherry Blossom Macro', seed: 'tokyo-macro-1', w: 800, h: 534, neighborhood: 'Shinjuku Gyoen', category: 'MACRO', author: yuki, desc: '105mm macro, f/4.5. Waited for no wind.', days: 14, votes: 35 },
    { title: 'Raindrop on Maple', seed: 'tokyo-macro-2', w: 800, h: 800, neighborhood: 'Yanaka', category: 'MACRO', author: yuki, desc: 'Autumn detail. Nature\'s own lens.', days: 22, votes: 29 },

    // Hiro — Landscape + Travel
    { title: 'Mt Fuji from Kawaguchi', seed: 'tokyo-landscape-1', w: 800, h: 534, neighborhood: 'Odaiba', category: 'LANDSCAPE', author: hiro, desc: 'Woke up at 3am. Worth every minute.', days: 4, votes: 89 },
    { title: 'Autumn Nikko Valley', seed: 'tokyo-landscape-2', w: 800, h: 1067, neighborhood: 'Asakusa', category: 'LANDSCAPE', author: hiro, desc: 'Two-hour drive from Tokyo, but another world.', days: 9, votes: 66 },
    { title: 'Tsukiji Morning Fish', seed: 'tokyo-travel-1', w: 800, h: 600, neighborhood: 'Tsukiji', category: 'TRAVEL', author: hiro, desc: 'The old market spirit still alive at 4am.', days: 15, votes: 41 },
    { title: 'Senso-ji Incense Fog', seed: 'tokyo-travel-2', w: 800, h: 1200, neighborhood: 'Asakusa', category: 'TRAVEL', author: hiro, desc: 'Smoke and silence before the tourist crowds arrive.', days: 25, votes: 54 },

    // Luna — Wildlife + Abstract
    { title: 'Ueno Park Crow', seed: 'tokyo-wildlife-1', w: 800, h: 800, neighborhood: 'Ueno', category: 'WILDLIFE', author: luna, desc: 'Tokyo\'s true rulers. 600mm, 1/2000s.', days: 6, votes: 37 },
    { title: 'Koi at Hamarikyu', seed: 'tokyo-wildlife-2', w: 800, h: 534, neighborhood: 'Shimbashi', category: 'WILDLIFE', author: luna, desc: 'Long lens through the lily pads.', days: 11, votes: 31 },
    { title: 'Shibuya Blur Abstract', seed: 'tokyo-abstract-1', w: 800, h: 1067, neighborhood: 'Shibuya', category: 'ABSTRACT', author: luna, desc: '2-second exposure, panning. Intentional camera movement.', days: 16, votes: 46 },
    { title: 'Light Trails Expressway', seed: 'tokyo-abstract-2', w: 800, h: 600, neighborhood: 'Shinjuku', category: 'ABSTRACT', author: luna, desc: '30 seconds of Tokyo moving.', days: 30, votes: 52 },

    // Admin — extra
    { title: 'Meiji Shrine Forest', seed: 'tokyo-other-1', w: 800, h: 1067, neighborhood: 'Harajuku', category: 'OTHER', author: admin, desc: 'Urban forest in the heart of the city.', days: 2, votes: 43 },
    { title: 'Tsukishima Monja Street', seed: 'tokyo-other-2', w: 800, h: 600, neighborhood: 'Tsukishima', category: 'OTHER', author: admin, desc: 'Old downtown feels. Everyone knows everyone.', days: 8, votes: 24 },
    { title: 'Toyosu Fish Auction', seed: 'tokyo-other-3', w: 800, h: 534, neighborhood: 'Toyosu', category: 'TRAVEL', author: admin, desc: 'The new market, same pre-dawn energy.', days: 19, votes: 36 },
    { title: 'Akihabara Night Signs', seed: 'tokyo-other-4', w: 800, h: 1200, neighborhood: 'Akihabara', category: 'NIGHT', author: admin, desc: 'Electric Town lives up to the name after dark.', days: 28, votes: 61 },
  ]

  const createdPhotos: any[] = []
  for (const p of photoData) {
    const created = await prisma.photo.upsert({
      where: { id: `seed-photo-${p.seed}` },
      update: { voteCount: p.votes },
      create: {
        id: `seed-photo-${p.seed}`,
        title: p.title,
        description: p.desc,
        imageUrl: img(p.seed, p.w, p.h),
        thumbnailUrl: thumb(p.seed),
        width: p.w,
        height: p.h,
        fileSize: 1_200_000,
        neighborhood: p.neighborhood,
        category: p.category as any,
        status: 'APPROVED',
        authorId: p.author.id,
        voteCount: p.votes,
        approvedAt: daysAgo(p.days + 1),
        createdAt: daysAgo(p.days),
      },
    })
    createdPhotos.push({ ...created, meta: p })
  }

  // ── Votes ───────────────────────────────────────────────────────────────────
  // Each user votes on a selection of photos (not their own)
  const votePairs: [string, string][] = []
  for (const voter of users) {
    const eligible = createdPhotos.filter(p => p.authorId !== voter.id)
    const picks = eligible.sort(() => Math.random() - 0.5).slice(0, 10)
    for (const photo of picks) {
      votePairs.push([voter.id, photo.id])
    }
  }
  for (const [userId, photoId] of votePairs) {
    await prisma.vote.upsert({
      where: { userId_photoId: { userId, photoId } },
      update: {},
      create: { userId, photoId },
    })
  }

  // ── Comments ────────────────────────────────────────────────────────────────
  const commentPool = [
    'Incredible light here, how did you nail the exposure?',
    'This is my favourite spot in Tokyo too! Great composition.',
    'The depth of field is perfect on this one.',
    'Love the mood. What time of day did you shoot this?',
    'Been to this spot many times but never captured it like this.',
    'The bokeh is incredible, what lens did you use?',
    'Color grading is on point. Film emulation?',
    'This makes me miss Tokyo so much.',
    'Stunning work as always!',
    'The leading lines really draw the eye in.',
    'Shot on a rainy day? The reflections are beautiful.',
    'How long was your shutter speed for the light trails?',
  ]
  let commentIdx = 0
  for (let i = 0; i < createdPhotos.length; i++) {
    const photo = createdPhotos[i]!
    const commenters = users.filter(u => u.id !== photo.authorId).slice(0, 3)
    for (const commenter of commenters) {
      await prisma.comment.create({
        data: {
          body: commentPool[commentIdx % commentPool.length]!,
          authorId: commenter.id,
          photoId: photo.id,
          createdAt: daysAgo(Math.floor(Math.random() * 5)),
        },
      })
      commentIdx++
    }
  }

  // ── Forum threads & replies ─────────────────────────────────────────────────
  const forumCategories = await prisma.forumCategory.findMany()
  const catMap = Object.fromEntries(forumCategories.map(c => [c.slug, c.id]))

  const threads = [
    // ── Equipment Reviews ──────────────────────────────────────────────────────
    {
      title: 'Sony A7R V vs Nikon Z8 for Tokyo street — which do you prefer?',
      body: 'I\'ve been shooting the Sony A7R V for the past year and absolutely love the resolution for cropping in post. But a friend swears by the Nikon Z8\'s autofocus for moving subjects in crowds. Anyone have first-hand experience switching between the two in a Tokyo street context? Battery life in the cold is also a concern for me.',
      categoryId: catMap['EQUIPMENT_REVIEWS']!, author: kenji, days: 14,
      replies: [
        { body: 'I switched from Sony to Nikon Z8 last spring and haven\'t looked back. The AF tracking in Shibuya crowds is unreal.', author: sakura, days: 13 },
        { body: 'The A7R V eye-AF is actually very close now after firmware updates. But yes, Nikon battery life wins easily.', author: hiro, days: 12 },
        { body: 'For street, I\'d actually recommend the Fuji X100VI — smaller, lighter, street-friendly.', author: yuki, days: 11 },
      ]
    },
    {
      title: 'Best budget tripod for urban night photography?',
      body: 'I\'m looking to get into long exposure night photography around Tokyo. Don\'t want to spend ¥50,000+ on a Gitzo. What tripods have you used that are sturdy enough for 20-30 second exposures on a full-frame body but won\'t break the bank? Carbon fibre vs aluminium at the budget end?',
      categoryId: catMap['EQUIPMENT_REVIEWS']!, author: yuki, days: 10,
      replies: [
        { body: 'Peak Design Travel Tripod is pricey but worth every yen — especially for urban shooting where you carry it all day.', author: kenji, days: 9 },
        { body: 'Benro Mach3 is solid aluminium at a good price point. Served me well for 3 years of night shooting.', author: hiro, days: 9 },
        { body: 'Whatever you get, add a sandbag hook to the centre column. Wind on Odaiba waterfront will ruin a light tripod at slow shutter.', author: sakura, days: 8 },
        { body: 'Don\'t overlook the head — a cheap ball head will let you down on heavy bodies. Invest more in the head than the legs.', author: luna, days: 7 },
      ]
    },
    {
      title: 'Circular polariser recommendations for shooting through glass in Tokyo?',
      body: 'I want to shoot reflections in Roppongi and Marunouchi architecture but keep getting ghosting. A CPL should help but I\'m not sure what brand to trust for the colour neutrality. Anyone use one regularly in the city?',
      categoryId: catMap['EQUIPMENT_REVIEWS']!, author: sakura, days: 6,
      replies: [
        { body: 'B+W is the gold standard for colour neutrality. Expensive but you\'ll use it for years. Don\'t cheap out on glass in front of your glass.', author: kenji, days: 5 },
        { body: 'Kenko Zeta is a very respectable Japanese option at about half the price of B+W. Hard to tell the difference in side-by-side tests.', author: hiro, days: 5 },
        { body: 'Also try a variable ND with polariser — doubles up for daytime long exposure. The Freewell ones are popular here.', author: luna, days: 4 },
      ]
    },
    {
      title: 'Is the Fujifilm X-T5 worth it for someone coming from a Sony ecosystem?',
      body: 'I\'ve been full Sony mirrorless (A6600 then A7 III) for six years but I\'m increasingly drawn to the Fuji colours and the smaller form factor. The X-T5 sensor looks incredible. What\'s the real-world AF gap in 2024? And is the manual dial interface a joy or annoying once novelty wears off?',
      categoryId: catMap['EQUIPMENT_REVIEWS']!, author: luna, days: 4,
      replies: [
        { body: 'The AF gap has narrowed dramatically in the last two firmware releases. It won\'t beat Sony at fast sports but for street and portrait it\'s absolutely fine.', author: hiro, days: 3 },
        { body: 'The dials are genuinely joyful. You develop actual muscle memory for settings quickly. I\'d never go back to button menus now.', author: yuki, days: 3 },
        { body: 'Colours are the real reason to switch. Velvia and Classic Chrome straight out of camera are better than anything I\'ve got from Sony raws.', author: sakura, days: 2 },
        { body: 'One warning: the battery life is poor. Carry at least 3 batteries for an all-day Tokyo shoot.', author: admin, days: 2 },
      ]
    },

    // ── Tokyo Photo Spots ──────────────────────────────────────────────────────
    {
      title: 'Best spots for blue hour in Shinjuku — share your secrets',
      body: 'I keep seeing incredible blue hour shots from Shinjuku on here and I can\'t figure out the exact positions. The Tokyo Metropolitan Government Building rooftop is obvious, but what else? Specifically looking for spots that show the neon district from above or at street level with good framing.',
      categoryId: catMap['TOKYO_PHOTO_SPOTS']!, author: sakura, days: 20,
      replies: [
        { body: 'The west exit park area gives you a great angle on the skyscrapers with foreground interest. Underrated.', author: kenji, days: 19 },
        { body: 'Takashimaya Times Square rooftop terrace on the south side! You get the JR lines as leading lines.', author: luna, days: 19 },
        { body: 'Also try the Dai-ichi Seimei building bridge — connects two buildings over the street and gives a unique overhead view.', author: hiro, days: 18 },
      ]
    },
    {
      title: 'Asakusa early morning — best arrival time?',
      body: 'I want to shoot Senso-ji without crowds. I\'ve heard 5am works, but sunrise varies so much through the year. What\'s your experience? Also is there a good vantage point for the thunder gate (Kaminarimon) with nobody in it?',
      categoryId: catMap['TOKYO_PHOTO_SPOTS']!, author: yuki, days: 17,
      replies: [
        { body: 'In summer, 4:30am gives you the best light and almost no people. Winter it\'s darker but still manageable at 6am.', author: hiro, days: 16 },
        { body: 'The gate itself is hard to get empty. I\'ve had luck very early on weekday mornings in February. Patience and waiting for the rare gap.', author: luna, days: 16 },
      ]
    },
    {
      title: 'Hidden spots in Yanaka that tourists haven\'t found yet',
      body: 'Yanaka is my favourite neighbourhood to shoot but I\'m running out of fresh angles at the popular spots. Does anyone know the narrower side streets, old shotengai, or hidden shrines that the photography crowd hasn\'t descended on yet? Share what you\'ve found.',
      categoryId: catMap['TOKYO_PHOTO_SPOTS']!, author: hiro, days: 11,
      replies: [
        { body: 'The cemetery at golden hour is genuinely stunning and almost always deserted. Old trees, dappled light, and cats everywhere.', author: sakura, days: 10 },
        { body: 'There\'s a tiny covered shotengai off Yanaka-Ginza that still has a Showa-era tofu shop and a single-seat barber. Pure gold visually.', author: kenji, days: 10 },
        { body: 'Look for the orange torii cluster about 10 min north of the main cemetery. Completely hidden from the main tourist route.', author: yuki, days: 9 },
        { body: 'The rooftops here tell a story — corrugated iron, laundry lines, old antenna. Get high if you can find access.', author: luna, days: 8 },
      ]
    },
    {
      title: 'Hamarikyu Gardens — is it worth the ¥300 entry for photography?',
      body: 'I\'ve been putting off visiting Hamarikyu because of the entry fee, but I keep seeing stunning koi and landscape shots from there. What\'s the light like? Best time of year? And is the contrast with the surrounding skyscrapers as dramatic in person as it looks in photos?',
      categoryId: catMap['TOKYO_PHOTO_SPOTS']!, author: admin, days: 7,
      replies: [
        { body: 'Absolutely worth it. The skyscraper backdrop with the traditional garden in the foreground is genuinely one of the best compositions in Tokyo.', author: luna, days: 6 },
        { body: 'Autumn is peak season — the maples turn brilliant red against the glass towers. Go mid-November for best colour.', author: hiro, days: 6 },
        { body: '¥300 is nothing. I\'ve spent entire mornings there. The tidal pools change with the tide so plan around that for the koi shots.', author: yuki, days: 5 },
      ]
    },
    {
      title: 'Odaiba after dark — practical guide for a long exposure session',
      body: 'Planning a full night shoot on the Odaiba waterfront next month to capture Rainbow Bridge and the city skyline. Looking for advice on: best side of the waterfront, access hours, whether there are usable tripod positions, and how to deal with the ferry lights passing through long exposures.',
      categoryId: catMap['TOKYO_PHOTO_SPOTS']!, author: kenji, days: 3,
      replies: [
        { body: 'The north beach area near Decks has the classic Rainbow Bridge angle. The promenade lets you set up freely and there\'s no real curfew.', author: sakura, days: 3 },
        { body: 'For the ferry issue, use a remote and wait for a gap between crossings. Or embrace them — the light streaks can add dynamism.', author: hiro, days: 2 },
        { body: 'Bring warm layers. The wind off Tokyo Bay is brutal in winter. I\'ve been there in January and couldn\'t feel my hands after an hour.', author: luna, days: 2 },
      ]
    },

    // ── Critique My Work ──────────────────────────────────────────────────────
    {
      title: 'My Shibuya blur shot — thoughts on the abstraction level?',
      body: 'I\'ve been experimenting with intentional camera movement (ICM) at Shibuya. Some people love the full abstraction, others say it loses too much of the sense of place. Posting my latest attempt — curious where the TokyoLens community falls on this.',
      categoryId: catMap['CRITIQUE_MY_WORK']!, author: luna, days: 12,
      replies: [
        { body: 'I think the abstraction works here because you can still feel the urban density. If it were completely unrecognisable it might lose impact.', author: yuki, days: 11 },
        { body: 'The colour palette is the real star. That cyan-magenta split feels very Tokyo.', author: sakura, days: 11 },
      ]
    },
    {
      title: 'Critique my Senso-ji incense fog shot — too processed?',
      body: 'I captured incense smoke at Senso-ji in the morning and pushed the contrast and clarity quite hard in post. Some of my photographer friends say it looks over-processed, but I feel it matches the almost cinematic quality of the scene. Would love an honest opinion from people who shoot temples regularly.',
      categoryId: catMap['CRITIQUE_MY_WORK']!, author: hiro, days: 9,
      replies: [
        { body: 'The smoke rendering looks great but the shadows might be lifted a touch too much for the mood. A little more darkness in the corners would add gravitas.', author: kenji, days: 8 },
        { body: 'The clarity slider can be a trap — it adds texture but can make skin and foliage look crunchy. Try structure instead if you\'re on Lightroom.', author: yuki, days: 8 },
        { body: 'I actually like the processing. Temple photography often benefits from a slightly otherworldly look. Stay true to your vision.', author: luna, days: 7 },
        { body: 'The incense light itself is the hero — everything else should serve it. Check if the background is fighting for attention.', author: admin, days: 7 },
      ]
    },
    {
      title: 'First night photography attempt — be brutal',
      body: 'I\'ve been shooting during the day for two years and finally tried my first real night shoot in Shinjuku last week. I know there are issues — some motion blur I didn\'t intend, some colour casts I couldn\'t fix in post. Looking for specific technical feedback so I know what to work on next session.',
      categoryId: catMap['CRITIQUE_MY_WORK']!, author: sakura, days: 5,
      replies: [
        { body: 'Good instincts on composition already. The main technical fix: shoot in K (Kelvin) white balance instead of Auto at night — Auto gets confused by mixed light sources.', author: kenji, days: 5 },
        { body: 'The unintentional blur is almost certainly from shooting at 1/30s or slower handheld. Aim for at least 1/focal-length as a minimum. Or accept blur and commit to it creatively.', author: hiro, days: 4 },
        { body: 'For mixed lighting in Shinjuku, I shoot in monochrome at night. Removes all the colour cast problems entirely and often the B&W actually suits the mood better.', author: luna, days: 4 },
      ]
    },
    {
      title: 'Feedback on my Harajuku portrait series — natural light only',
      body: 'I shoot portraits entirely in available light — no flash, no reflectors. Harajuku gives incredible cosplay subjects who are usually happy to be photographed. My concern is the bright backgrounds often blowing out while the subject is correctly exposed. How do you handle the contrast ratios without artificial light?',
      categoryId: catMap['CRITIQUE_MY_WORK']!, author: yuki, days: 2,
      replies: [
        { body: 'Find a shaded spot nearby and bring your subject into it. The costume colours pop more in shade than in direct sun anyway.', author: sakura, days: 2 },
        { body: 'Shoot in the direction of light on overcast days — the sky becomes a giant softbox and the exposure problem largely disappears.', author: kenji, days: 1 },
        { body: 'Expose for the face and let the background blow. In cosplay portraits the subject is everything — nobody minds a slightly bright sky.', author: hiro, days: 1 },
      ]
    },

    // ── General ───────────────────────────────────────────────────────────────
    {
      title: 'How do you handle memory card strategy for all-day shoots?',
      body: 'Going on a 10-hour Tokyo walk next weekend and trying to plan my card strategy. Do you shoot RAW+JPEG, RAW only? How many cards, what capacity? I got burned last month when one card corrupted mid-shoot. Looking for your workflow tips.',
      categoryId: catMap['GENERAL']!, author: hiro, days: 15,
      replies: [
        { body: 'Always shoot to two cards simultaneously if your camera supports it. Lost a wedding to one card corruption years ago — never again.', author: kenji, days: 14 },
        { body: 'RAW only, multiple 128GB V90 cards. I swap cards every 3 hours regardless of how full they are.', author: admin, days: 14 },
        { body: 'I do RAW+JPEG for insurance. The JPEGs are immediately shareable and the RAWs are my backup for important shots.', author: sakura, days: 13 },
      ]
    },
    {
      title: 'Photography etiquette in Tokyo — what are the unwritten rules?',
      body: 'I\'m coming to Tokyo for the first time from overseas specifically to shoot. I know the legal rules around photography in public spaces but I\'m more interested in the social etiquette. When do locals get uncomfortable? How do you approach strangers for portraits? Any areas or situations where I should be particularly careful?',
      categoryId: catMap['GENERAL']!, author: admin, days: 13,
      replies: [
        { body: 'In shrines and temples, be quiet and respectful — obvious really, but I\'ve seen photographers fire rapid bursts during ceremonies. Never do that.', author: hiro, days: 12 },
        { body: 'Always ask before photographing someone closely. Japanese people rarely say no but asking shows respect. A smile and a gesture goes a long way.', author: yuki, days: 12 },
        { body: 'Izakayas and small restaurants often don\'t want photos. Look for signs, and if unsure just ask. Most places that want to keep atmosphere are fine with one polite shot.', author: sakura, days: 11 },
        { body: 'On trains, pointing cameras at people without permission is considered rude. Street is different — Shibuya crossing is understood to be fair game by everyone there.', author: kenji, days: 11 },
        { body: 'The Comiket cosplay area at Tokyo Big Sight has its own etiquette sheet distributed at the entrance. Study it — the cosplayer community is very organised about photography rights.', author: luna, days: 10 },
      ]
    },
    {
      title: 'Shooting in rain — tips for Tokyo wet season?',
      body: 'June and July in Tokyo are notoriously rainy but I\'ve seen some incredible rain-soaked shots from those months. What\'s your approach to gear protection, keeping your lens dry, and finding shots that actually benefit from the rain rather than fighting it?',
      categoryId: catMap['GENERAL']!, author: sakura, days: 8,
      replies: [
        { body: 'Rain covers for the body are cheap and essential. I use a Think Tank Hydrophobia. Also a lens hood dramatically reduces front element water contact.', author: kenji, days: 8 },
        { body: 'Embrace puddle reflections — the best rain shots in Tokyo are usually looking down. Shibuya crossing after rain with the neon reflections is almost unfair it\'s so good.', author: hiro, days: 7 },
        { body: 'Microfibre cloths in every pocket. Have three on you, rotating wet to dry. You\'ll use them more than you expect.', author: luna, days: 7 },
        { body: 'The first 10 minutes of a shower before everyone puts umbrellas up gives you a brief window of natural wet street looks. Be ready before it rains.', author: yuki, days: 6 },
      ]
    },
    {
      title: 'How do you organise 10,000+ photos from a Tokyo trip?',
      body: 'Just came back from three weeks shooting and I\'m overwhelmed. I have roughly 12,000 RAW files and I don\'t even know where to start. Lightroom Classic vs Capture One? Folder structure by date vs location vs subject? How do the prolific shooters here manage their libraries?',
      categoryId: catMap['GENERAL']!, author: yuki, days: 5,
      replies: [
        { body: 'First pass: star 1 everything you\'d ever show anyone, discard the rest. Don\'t be sentimental. You probably have 1,500 real keepers in there.', author: admin, days: 4 },
        { body: 'Capture One for image quality and tethering, Lightroom Classic for library organisation and mobile sync. I use both but C1 for the actual editing.', author: kenji, days: 4 },
        { body: 'Folder structure: Year > Month > Location > Shoot. Never by subject — subjects change your mind but location is always a fact.', author: hiro, days: 3 },
        { body: 'Use Lightroom\'s AI subject tagging after import. It\'s not perfect but getting "Shibuya", "portrait", "night" auto-tagged saves hours of manual keywording.', author: sakura, days: 3 },
      ]
    },
    {
      title: 'Street photography and "no photography" signs — where\'s the line?',
      body: 'Had a tense moment last week at a covered market where someone pointed to a small "no photography" sign I hadn\'t seen. I apologised and deleted the images in front of them. But I\'ve seen other photographers completely ignore such signs. What\'s your actual approach to this, legally and ethically?',
      categoryId: catMap['GENERAL']!, author: kenji, days: 2,
      replies: [
        { body: 'Private property, their rules. No debate needed. There are ten thousand better shots nearby that don\'t require being somewhere unwelcome.', author: admin, days: 2 },
        { body: 'Sometimes it\'s worth asking why — covered markets often have the rule because of past commercial disputes, not privacy. A friendly conversation can sometimes get you an exception.', author: hiro, days: 1 },
        { body: 'I learned to look for signs before shooting any enclosed commercial space. Takes 5 seconds and saves the awkward situation entirely.', author: yuki, days: 1 },
      ]
    },
  ]

  for (const t of threads) {
    const existing = await prisma.forumThread.findFirst({ where: { title: t.title } })
    if (existing) continue
    const lastReplyDays = t.replies.length > 0 ? Math.min(...t.replies.map((r: any) => r.days)) : t.days
    const thread = await prisma.forumThread.create({
      data: {
        title: t.title, body: t.body,
        authorId: t.author.id, categoryId: t.categoryId,
        replyCount: t.replies.length,
        lastReplyAt: daysAgo(lastReplyDays),
        createdAt: daysAgo(t.days),
      },
    })
    for (const r of t.replies) {
      await prisma.forumReply.create({
        data: { body: r.body, authorId: r.author.id, threadId: thread.id, createdAt: daysAgo(r.days) },
      })
    }
  }

  // ── Awards ───────────────────────────────────────────────────────────────────
  const topPhoto = createdPhotos.find(p => p.meta.seed === 'tokyo-landscape-1')! // Mt Fuji, votes: 89
  const secondPhoto = createdPhotos.find(p => p.meta.seed === 'tokyo-night-1')!  // Shinjuku Neons, votes: 72

  const weekStart = daysAgo(7)
  const weekEnd = now
  await prisma.award.upsert({
    where: { type_periodStart: { type: 'WEEKLY_WINNER', periodStart: weekStart } },
    update: {},
    create: {
      type: 'WEEKLY_WINNER',
      photoId: topPhoto.id, userId: topPhoto.authorId,
      periodStart: weekStart, periodEnd: weekEnd,
      voteCount: topPhoto.meta.votes,
    },
  })

  const monthStart = daysAgo(30)
  const monthEnd = now
  await prisma.award.upsert({
    where: { type_periodStart: { type: 'MONTHLY_WINNER', periodStart: monthStart } },
    update: {},
    create: {
      type: 'MONTHLY_WINNER',
      photoId: secondPhoto.id, userId: secondPhoto.authorId,
      periodStart: monthStart, periodEnd: monthEnd,
      voteCount: secondPhoto.meta.votes,
    },
  })

  // ── Collections ──────────────────────────────────────────────────────────────
  const streetPhotos = createdPhotos.filter(p => p.meta.category === 'STREET')
  const nightPhotos = createdPhotos.filter(p => p.meta.category === 'NIGHT')

  const sakuraColl = await prisma.collection.upsert({
    where: { id: 'seed-coll-sakura-1' },
    update: {},
    create: {
      id: 'seed-coll-sakura-1', name: 'Tokyo Street Favourites',
      description: 'My personal picks for the best street shots on the platform.',
      isPrivate: false, userId: sakura.id,
      coverUrl: nightPhotos[0] ? img(nightPhotos[0].meta.seed, 400, 500) : null,
    },
  })
  for (const photo of [...streetPhotos.slice(0, 3), ...nightPhotos.slice(0, 2)]) {
    await prisma.collectionItem.upsert({
      where: { collectionId_photoId: { collectionId: sakuraColl.id, photoId: photo.id } },
      update: {},
      create: { collectionId: sakuraColl.id, photoId: photo.id },
    })
  }

  const kenjiColl = await prisma.collection.upsert({
    where: { id: 'seed-coll-kenji-1' },
    update: {},
    create: {
      id: 'seed-coll-kenji-1', name: 'Night City Inspiration',
      isPrivate: false, userId: kenji.id,
      coverUrl: nightPhotos[0] ? img(nightPhotos[0].meta.seed, 400, 500) : null,
    },
  })
  for (const photo of nightPhotos) {
    await prisma.collectionItem.upsert({
      where: { collectionId_photoId: { collectionId: kenjiColl.id, photoId: photo.id } },
      update: {},
      create: { collectionId: kenjiColl.id, photoId: photo.id },
    })
  }

  // ── Follows ──────────────────────────────────────────────────────────────────
  const followPairs: [string, string][] = [
    [sakura.id, kenji.id], [sakura.id, yuki.id], [sakura.id, hiro.id],
    [kenji.id, sakura.id], [kenji.id, luna.id],
    [yuki.id, sakura.id], [yuki.id, kenji.id],
    [hiro.id, sakura.id], [hiro.id, luna.id], [hiro.id, yuki.id],
    [luna.id, kenji.id], [luna.id, hiro.id],
  ]
  for (const [followerId, followingId] of followPairs) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    })
  }

  console.log(`✓ Seed complete — ${createdPhotos.length} photos, ${threads.length} forum threads (${threads.reduce((a, t) => a + t.replies.length, 0)} replies), 2 awards`)
  console.log('  Demo login: demo@tokyolens.jp / demo123456')
  console.log('  Admin login: admin@tokyolens.jp / admin123456')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
