import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all categories
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    // Get all existing posts to collect unique flags
    const posts = await prisma.post.findMany({
      select: { flags: true },
      where: { flags: { isEmpty: false } }
    });

    // Collect unique flags
    const uniqueFlags = new Set<string>();
    posts.forEach(post => {
      post.flags.forEach((flag: string) => uniqueFlags.add(flag));
    });

    const flagsList = Array.from(uniqueFlags).sort();

    // Nigerian states for dropdown
    const nigerianStates = [
      'President', 'Nigeria',
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
      'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
      'Kaduna', 'Kano', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun',
      'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create data validation object
    const validationData = {
      states: nigerianStates,
      categories: categories.map(c => c.name),
      flags: flagsList.length > 0 ? flagsList : ['MAIN_STORY', 'EDITORS_PICK', 'FEATURED', 'TRENDING', 'POPULAR', 'BREAKING_NEWS']
    };

    // Create template rows with examples
    const templateData = [
      {
        state: 'President',
        headline: 'President Tinubu Launches New Economic Recovery Plan',
        content: 'President Bola Tinubu has unveiled a comprehensive economic recovery plan aimed at boosting Nigeria\'s economic growth. The initiative focuses on key sectors including agriculture, manufacturing, and digital economy.',
        category: categories[0]?.name || 'Politics',
        'article flag': flagsList[0] || 'MAIN_STORY',
        tags: 'president, economy, governance',
        'schedule publish': ''
      },
      {
        state: 'Nigeria',
        headline: 'Federal Government Unveils National Infrastructure Plan',
        content: 'The Federal Government has launched a national infrastructure development plan to connect all regions of the country. The project includes roads, railways, and power infrastructure.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'EDITORS_PICK',
        tags: 'infrastructure, federal, development',
        'schedule publish': ''
      },
      {
        state: 'Lagos',
        headline: 'Sanwo-Olu Administration Launches New Infrastructure Project',
        content: 'The Lagos State Government has unveiled plans for a comprehensive infrastructure overhaul aimed at improving connectivity across the metropolis. Governor Babajide Sanwo-Olu announced the initiative during a press briefing, highlighting the importance of modern infrastructure for economic growth.',
        category: categories[0]?.name || 'Politics',
        'article flag': flagsList[0] || 'MAIN_STORY',
        tags: 'politics, governance, development',
        'schedule publish': ''
      },
      {
        state: 'Kano',
        headline: 'Kano State Expands Healthcare Facilities',
        content: 'Kano State Government has approved the construction of three new general hospitals to serve underserved communities. The administration is committed to improving healthcare access and quality for all residents of the state.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'EDITORS_PICK',
        tags: 'healthcare, government, development',
        'schedule publish': ''
      },
      {
        state: 'Rivers',
        headline: 'Rivers State Launches Agricultural Initiative',
        content: 'Rivers State has rolled out a new agricultural support program designed to empower small-scale farmers and boost food production. The initiative includes provision of improved seedlings, fertilizers, and technical support.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'FEATURED',
        tags: 'agriculture, farming, economy',
        'schedule publish': ''
      },
      {
        state: 'Kaduna',
        headline: 'Kaduna Government Opens New Technical Colleges',
        content: 'Kaduna State Government has inaugurated three new technical colleges to boost skills acquisition among youth. The institutions will focus on vocational training in key sectors including ICT, engineering, and construction.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'TRENDING',
        tags: 'education, youth, skills',
        'schedule publish': ''
      },
      {
        state: 'Enugu',
        headline: 'Enugu State Strengthens Security Infrastructure',
        content: 'The Enugu State Government has invested heavily in security infrastructure across the state. Governor Peter Mbah stated that the measure aims to ensure safety of lives and property while fostering economic activities.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'POPULAR',
        tags: 'security, governance, safety',
        'schedule publish': ''
      },
      {
        state: 'Delta',
        headline: 'Delta Government Unveils Renewable Energy Plan',
        content: 'Delta State has announced a comprehensive renewable energy plan aimed at reducing carbon emissions while meeting growing energy demands. The initiative includes solar farms and wind energy projects.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'FEATURED',
        tags: 'energy, environment, sustainability',
        'schedule publish': ''
      },
      {
        state: 'Oyo',
        headline: 'Oyo State Improves Educational Infrastructure',
        content: 'Oyo State Government has embarked on massive renovation of public schools across the state. The project includes construction of new classrooms, libraries, and science laboratories.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'EDITORS_PICK',
        tags: 'education, infrastructure, schools',
        'schedule publish': ''
      },
      {
        state: 'Imo',
        headline: 'Imo State Boosts Industrial Development',
        content: 'Imo State Government has launched a new industrial development initiative to attract manufacturing companies. The program offers tax incentives and infrastructure support to investors.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'MAIN_STORY',
        tags: 'industry, investment, economy',
        'schedule publish': ''
      },
      {
        state: 'Ogun',
        headline: 'Ogun State Expands Digital Infrastructure',
        content: 'Ogun State has expanded its digital infrastructure to support growing tech startups. The government is building data centers and improving broadband connectivity across the state.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'TRENDING',
        tags: 'technology, digital, startups',
        'schedule publish': ''
      },
      {
        state: 'Ekiti',
        headline: 'Ekiti State Promotes Tourism Development',
        content: 'Ekiti State Government has unveiled plans to develop tourist sites and attractions. The initiative aims to boost the state\'s tourism sector and create employment opportunities.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'POPULAR',
        tags: 'tourism, economy, employment',
        'schedule publish': ''
      },
      {
        state: 'Edo',
        headline: 'Edo State Enhances Sports Development',
        content: 'Edo State Government has upgraded sporting facilities across the state. The rehabilitation of stadiums and sports centers will host national and international competitions.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'FEATURED',
        tags: 'sports, infrastructure, youth',
        'schedule publish': ''
      },
      {
        state: 'Anambra',
        headline: 'Anambra State Supports Small Businesses',
        content: 'Anambra State Government has launched a grant scheme for small and medium enterprises. The program provides funding and mentorship to entrepreneurs across various sectors.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'EDITORS_PICK',
        tags: 'business, SME, economy',
        'schedule publish': ''
      },
      {
        state: 'Abia',
        headline: 'Abia State Revitalizes Textile Industry',
        content: 'Abia State Government is working to revitalize the once-thriving textile industry. The initiative includes provision of modern machinery and training for artisans.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'POPULAR',
        tags: 'industry, manufacturing, employment',
        'schedule publish': ''
      },
      {
        state: 'Akwa Ibom',
        headline: 'Akwa Ibom Develops Aviation Sector',
        content: 'Akwa Ibom State has invested in aviation infrastructure including a new airport terminal. The project aims to boost commerce and tourism in the state.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'MAIN_STORY',
        tags: 'aviation, infrastructure, commerce',
        'schedule publish': ''
      },
      {
        state: 'Bayelsa',
        headline: 'Bayelsa State Protects Marine Environment',
        content: 'Bayelsa State Government has launched environmental protection programs for its marine ecosystem. The initiative includes combating oil pollution and preserving mangrove forests.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'TRENDING',
        tags: 'environment, marine, conservation',
        'schedule publish': ''
      },
      {
        state: 'Cross River',
        headline: 'Cross River Promotes Eco-Tourism',
        content: 'Cross River State Government is developing eco-tourism sites to showcase its natural beauty. The initiative includes sustainable tourism practices and community involvement.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'FEATURED',
        tags: 'tourism, environment, community',
        'schedule publish': ''
      },
      {
        state: 'Benue',
        headline: 'Benue State Strengthens Agricultural Value Chain',
        content: 'Benue State Government has established agro-processing industries to add value to agricultural products. The move aims to boost farmers\' income and reduce post-harvest losses.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'EDITORS_PICK',
        tags: 'agriculture, value chain, economy',
        'schedule publish': ''
      },
      {
        state: 'Plateau',
        headline: 'Plateau State Promotes Peace and Unity',
        content: 'Plateau State Government has organized community dialogues to foster peace and unity among diverse ethnic groups. The initiative aims to resolve conflicts and promote development.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'POPULAR',
        tags: 'peace, unity, community',
        'schedule publish': ''
      },
      {
        state: 'Borno',
        headline: 'Borno State Advances Post-Conflict Recovery',
        content: 'Borno State Government is implementing comprehensive recovery programs in conflict-affected areas. The initiative includes reconstruction of schools, hospitals, and markets.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'MAIN_STORY',
        tags: 'recovery, development, reconstruction',
        'schedule publish': ''
      },
      {
        state: 'Nasarawa',
        headline: 'Nasarawa State Develops Mineral Resources',
        content: 'Nasarawa State Government has partnered with investors to develop its vast mineral resources. The project includes mining and processing facilities for various minerals.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'FEATURED',
        tags: 'mining, resources, investment',
        'schedule publish': ''
      },
      {
        state: 'Kwara',
        headline: 'Kwara State Improves Public Transportation',
        content: 'Kwara State Government has launched a modern public transportation system. The initiative includes new buses, improved routes, and digital payment options.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'TRENDING',
        tags: 'transport, infrastructure, public service',
        'schedule publish': ''
      },
      {
        state: 'Niger',
        headline: 'Niger State Enhances Agricultural Research',
        content: 'Niger State Government has established agricultural research institutes to improve farming practices. The centers focus on crop improvement and sustainable farming methods.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'EDITORS_PICK',
        tags: 'research, agriculture, innovation',
        'schedule publish': ''
      },
      {
        state: 'Kebbi',
        headline: 'Kebbi State Supports Livestock Development',
        content: 'Kebbi State Government has implemented programs to support livestock farmers. The initiative includes veterinary services, feed subsidies, and market access support.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'POPULAR',
        tags: 'livestock, agriculture, farming',
        'schedule publish': ''
      },
      {
        state: 'Sokoto',
        headline: 'Sokoto State Promotes Traditional Education',
        content: 'Sokoto State Government has strengthened traditional Islamic education alongside formal schooling. The initiative includes curriculum development and teacher training.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'FEATURED',
        tags: 'education, tradition, curriculum',
        'schedule publish': ''
      },
      {
        state: 'Zamfara',
        headline: 'Zamfara State Boosts Gold Mining Sector',
        content: 'Zamfara State Government has modernized gold mining operations to improve safety and revenue. The initiative includes formalization of artisanal miners and improved processing facilities.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'TRENDING',
        tags: 'mining, gold, formalization',
        'schedule publish': ''
      },
      {
        state: 'Bauchi',
        headline: 'Bauchi State Expands Tourism Infrastructure',
        content: 'Bauchi State Government has developed tourism sites including Yankari Game Reserve. The project includes visitor centers, improved roads, and accommodation facilities.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'POPULAR',
        tags: 'tourism, wildlife, infrastructure',
        'schedule publish': ''
      },
      {
        state: 'Gombe',
        headline: 'Gombe State Promotes Agricultural Development',
        content: 'Gombe State Government has distributed agricultural inputs to farmers at subsidized rates. The initiative aims to boost food production and improve farmers\' livelihoods.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'EDITORS_PICK',
        tags: 'agriculture, farmers, subsidy',
        'schedule publish': ''
      },
      {
        state: 'Yobe',
        headline: 'Yobe State Advances Digital Literacy',
        content: 'Yobe State Government has launched digital literacy programs in schools and communities. The initiative includes provision of computers and internet access in underserved areas.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'FEATURED',
        tags: 'digital, literacy, education',
        'schedule publish': ''
      },
      {
        state: 'Taraba',
        headline: 'Taraba State Promotes Coffee Production',
        content: 'Taraba State Government has implemented programs to support coffee farmers. The initiative includes provision of improved seedlings, training, and market access.',
        category: categories[0]?.name || 'Politics',
        'article flag': 'TRENDING',
        tags: 'coffee, agriculture, farming',
        'schedule publish': ''
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // state
      { wch: 40 }, // headline
      { wch: 60 }, // content
      { wch: 15 }, // category
      { wch: 20 }, // article flag
      { wch: 30 }, // tags
      { wch: 20 }  // schedule publish
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Batch Upload Template');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return the Excel file
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="batch-upload-template.xlsx"'
      }
    });

  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}