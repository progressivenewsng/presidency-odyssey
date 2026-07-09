const bcrypt = require('bcryptjs');
require('dotenv').config();

require('tsx/cjs').register();
const { prisma } = require('../src/lib/prisma.ts');

async function main() {
    console.log('Starting seed...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const editorPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@presidencyodyssey.com' },
        update: { password: adminPassword },
        create: {
            email: 'admin@presidencyodyssey.com',
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
            emailVerified: new Date(),
        },
    });
    console.log('Created admin user:', adminUser.email);

    // Create editor user
    const editorUser = await prisma.user.upsert({
        where: { email: 'editor@presidencyodyssey.com' },
        update: { password: editorPassword },
        create: {
            email: 'editor@presidencyodyssey.com',
            password: editorPassword,
            name: 'Mofi Aluko',
            role: 'EDITOR',
            emailVerified: new Date(),
        },
    });
    console.log('Created editor user:', editorUser.email);

    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'politics' },
            update: {},
            create: { name: 'Politics', slug: 'politics' },
        }),
        prisma.category.upsert({
            where: { slug: 'economy' },
            update: {},
            create: { name: 'Economy', slug: 'economy' },
        }),
        prisma.category.upsert({
            where: { slug: 'sports' },
            update: {},
            create: { name: 'Sports', slug: 'sports' },
        }),
        prisma.category.upsert({
            where: { slug: 'security' },
            update: {},
            create: { name: 'Security', slug: 'security' },
        }),
    ]);
    console.log('Created categories:', categories.map(c => c.name));

    // Get category mapping
    const categoryMap = {
        Politics: categories.find(c => c.slug === 'politics').id,
        Economy: categories.find(c => c.slug === 'economy').id,
        Sports: categories.find(c => c.slug === 'sports').id,
        Security: categories.find(c => c.slug === 'security').id,
    };

    // Create posts with mock data
    const postsData = [{
            slug: 'shettima-rallies-borno-apc-for-unity',
            title: 'Shettima Rallies Borno APC for Unity as Gubio Emerges Governorship Candidate',
            content: "Vice President Kashim Shettima has returned to Abuja after participating in the All Progressives Congress governorship primary in Borno State. He urged all party faithful to close ranks and focus on delivering victory in the forthcoming elections. The emergence of the candidate is a strong signal of the party's unity in the state...",
            excerpt: 'VP Shettima calls for unity as APC governorship candidate emerges in Borno State.',
            category: 'Politics',
            flags: ['MAIN_STORY', 'POPULAR'],
            date: '2026-05-22',
        },
        {
            slug: 'nigeria-and-poland-strengthen-ties',
            title: 'Nigeria and Poland Strengthen Ties in Digital Economy, Defence and Agriculture',
            content: 'Nigeria and the Republic of Poland are exploring stronger cooperation in key sectors, including digital economy, defence, agriculture, and ship-building. The bilateral meetings aim to improve both nations economic prospects...',
            excerpt: 'Nigeria and Poland explore cooperation in digital economy, defence, and agriculture.',
            category: 'Economy',
            flags: ['EDITORS_PICK', 'TRENDING'],
            date: '2026-05-21',
        },
        {
            slug: 'presidency-reaffirms-tinubus-commitment',
            title: "Presidency Reaffirms Tinubu's Commitment to National Unity and Constitutional Order",
            content: 'The Presidency has reassured Nigerians that President Bola Ahmed Tinubu remains committed to national unity, constitutional democracy and responsible governance. He assured the public that all reform agendas are on track.',
            excerpt: 'President Tinubu reaffirms commitment to national unity and constitutional democracy.',
            category: 'Politics',
            flags: ['EDITORS_PICK'],
            date: '2026-05-21',
        },
        {
            slug: 'tinubu-hails-ndleas-major-breakthrough',
            title: "Tinubu Hails NDLEA's Major Breakthrough Against International Drug Network",
            content: 'President Bola Ahmed Tinubu has commended the National Drug Law Enforcement Agency for a major success in dismantling a sophisticated international drug syndicate operating within the country.',
            excerpt: 'President Tinubu commends NDLEA for dismantling international drug syndicate.',
            category: 'Security',
            flags: ['EDITORS_PICK'],
            date: '2026-05-20',
        },
        {
            slug: 'first-lady-champions-womens-growth',
            title: "First Lady Champions Women's Growth and Excellence in Public Service",
            content: "Nigeria's First Lady, Senator Oluremi Tinubu, has emphasized the importance of empowering women in the public service as a major tool for inclusive governance.",
            excerpt: 'First Lady advocates for women empowerment in public service.',
            category: 'Politics',
            flags: ['FEATURED'],
            date: '2026-05-19',
        },
        {
            slug: 'joint-us-nigeria-air-operations',
            title: 'Joint US-Nigeria Air Operations Record Major Security Gains in Borno',
            content: 'The Defence Headquarters has announced a major success in ongoing counterterrorism operations, with more than 20 ISIS/ISWAP fighters reportedly neutralised following a joint intelligence-led air strike.',
            excerpt: 'Joint US-Nigeria operations neutralise 20+ ISIS fighters in Borno.',
            category: 'Politics',
            flags: ['TRENDING'],
            date: '2026-05-21',
        },
        {
            slug: 'tinubu-welcomes-airbus-investment',
            title: "Tinubu Welcomes Airbus Investment Plan to Boost Nigeria's Aviation",
            content: 'President Bola Ahmed Tinubu has welcomed Airbus proposal to establish maintenance and hangar facilities in Nigeria, describing it as a massive boost to the aviation sector.',
            excerpt: 'Airbus proposal to establish maintenance facilities welcomed by President Tinubu.',
            category: 'Economy',
            flags: ['POPULAR', 'FEATURED'],
            date: '2026-05-21',
        },
        {
            slug: 'tinubu-assures-oyo-families',
            title: 'Tinubu Assures Oyo Families of Strong Federal Support in Rescue Efforts',
            content: 'President Bola Tinubu has assured the government and people of Oyo State that the Federal Government is working closely with state agencies to combat recent security challenges and provide relief.',
            excerpt: 'President Tinubu assures Oyo State of federal support in security efforts.',
            category: 'Politics',
            flags: ['FEATURED'],
            date: '2026-05-20',
        },
        {
            slug: 'tinubus-reforms-will-build-stronger-economy',
            title: "Tinubu's Reforms Will Build a Stronger Economy, APC Chairman Says",
            content: 'National Chairman of the All Progressives Congress has assured Nigerians that the economic reforms introduced by Mr. President are already showing positive signs of stabilizing the economy.',
            excerpt: 'APC Chairman says Tinubu economic reforms are stabilizing the economy.',
            category: 'Politics',
            flags: ['FEATURED'],
            date: '2026-05-21',
        },
    ];

    // Create posts
    for (const postData of postsData) {
        const categoryId = categoryMap[postData.category];

        const post = await prisma.post.upsert({
            where: { slug: postData.slug },
            update: {
                title: postData.title,
                content: postData.content,
                excerpt: postData.excerpt,
                categoryId: categoryId,
                authorId: editorUser.id,
                status: 'PUBLISHED',
                flags: postData.flags,
                publishedAt: new Date(postData.date),
                updatedAt: new Date(postData.date),
            },
            create: {
                slug: postData.slug,
                title: postData.title,
                content: postData.content,
                excerpt: postData.excerpt,
                categoryId: categoryId,
                authorId: editorUser.id,
                status: 'PUBLISHED',
                flags: postData.flags,
                publishedAt: new Date(postData.date),
                createdAt: new Date(postData.date),
                updatedAt: new Date(postData.date),
            },
        });
        console.log('Created/updated post:', post.title);
    }

    // Create some sample tags
    const tags = await Promise.all([
        prisma.tag.upsert({
            where: { slug: 'national' },
            update: {},
            create: { name: 'National', slug: 'national' },
        }),
        prisma.tag.upsert({
            where: { slug: 'politics' },
            update: {},
            create: { name: 'Politics', slug: 'politics' },
        }),
        prisma.tag.upsert({
            where: { slug: 'economy' },
            update: {},
            create: { name: 'Economy', slug: 'economy' },
        }),
        prisma.tag.upsert({
            where: { slug: 'security' },
            update: {},
            create: { name: 'Security', slug: 'security' },
        }),
    ]);
    console.log('Created tags:', tags.map(t => t.name));

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async() => {
        await prisma.$disconnect();
    });