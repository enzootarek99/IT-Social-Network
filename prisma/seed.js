const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

function printSeedHelp(error) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  const message = error instanceof Error ? error.message : String(error);

  console.error('\nSeed failed.');

  if (
    code === 'P2021' ||
    code === 'P2022' ||
    message.includes('does not exist') ||
    message.includes('table') ||
    message.includes('column')
  ) {
    console.error(
      'The database schema is not up to date. Run: npm run prisma:migrate && npm run db:seed',
    );
  } else if (
    code === 'P1001' ||
    code === 'P1002' ||
    message.includes('Can\'t reach database server')
  ) {
    console.error('PostgreSQL is not reachable. Start PostgreSQL and verify DATABASE_URL.');
  } else if (message.includes('Environment variable not found: DATABASE_URL')) {
    console.error('DATABASE_URL is missing. Copy .env.example to .env and .env.local.');
  } else {
    console.error('Run node prisma/seed.js to inspect the full error if needed.');
  }

  console.error('\nOriginal error:');
  console.error(error);
}

async function upsertUser(user) {
  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      username: user.username,
      role: user.role || 'USER',
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      bio: user.bio,
      company: user.company,
      location: user.location,
      website: user.website,
      skills: user.skills,
      experience: user.experience,
      education: user.education,
      portfolio: user.portfolio,
      password: await bcrypt.hash(user.password, 12),
    },
    create: {
      ...user,
      password: await bcrypt.hash(user.password, 12),
    },
  });
}

async function findOrCreatePost(data) {
  const existingPost = await prisma.post.findFirst({
    where: {
      authorId: data.authorId,
      content: data.content,
    },
  });

  if (existingPost) {
    return existingPost;
  }

  return prisma.post.create({ data });
}

async function findOrCreateComment(data) {
  const existingComment = await prisma.comment.findFirst({
    where: {
      postId: data.postId,
      authorId: data.authorId,
      content: data.content,
    },
  });

  if (existingComment) {
    return existingComment;
  }

  return prisma.comment.create({ data });
}

async function findOrCreateOpportunity(data) {
  const existingOpportunity = await prisma.freelanceOpportunity.findFirst({
    where: {
      title: data.title,
      company: data.company,
    },
  });

  if (existingOpportunity) {
    return existingOpportunity;
  }

  return prisma.freelanceOpportunity.create({ data });
}

async function findOrCreateEvent(data) {
  const existingEvent = await prisma.event.findFirst({
    where: {
      title: data.title,
      organizerId: data.organizerId,
    },
  });

  if (existingEvent) {
    return existingEvent;
  }

  return prisma.event.create({ data });
}

async function findOrCreateConversation(userAId, userBId) {
  const [participantAId, participantBId] = [userAId, userBId].sort();

  return prisma.conversation.upsert({
    where: {
      participantAId_participantBId: {
        participantAId,
        participantBId,
      },
    },
    update: {},
    create: {
      participantAId,
      participantBId,
    },
  });
}

async function findOrCreateMessage(data) {
  const existingMessage = await prisma.message.findFirst({
    where: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
    },
  });

  if (existingMessage) {
    return existingMessage;
  }

  return prisma.message.create({ data });
}

async function main() {
  const demo = await upsertUser({
    email: 'demo@example.com',
    username: 'demo',
    role: 'USER',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'User',
    title: 'Full Stack Developer',
    bio: 'Développeur full stack passionné par les produits SaaS, Next.js et PostgreSQL.',
    company: 'IT Social Network',
    location: 'Tunis, TN',
    website: 'https://example.com',
    skills: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    experience: [
      {
        role: 'Full Stack Developer',
        company: 'IT Social Network',
        period: '2023 - Aujourd’hui',
        description:
          'Construction de produits SaaS avec Next.js, Prisma, PostgreSQL et intégrations API.',
      },
    ],
    education: [
      {
        degree: 'Licence Informatique',
        school: 'Université de Tunis',
        period: '2018 - 2021',
        description: 'Développement web, bases de données et architecture logicielle.',
      },
    ],
    portfolio: [
      {
        title: 'Starter SaaS Next.js',
        url: 'https://example.com/saas-starter',
        description: 'Starter kit auth, dashboard, Prisma et Tailwind pour MVP B2B.',
      },
    ],
  });

  await upsertUser({
    email: 'admin@example.com',
    username: 'admin',
    role: 'ADMIN',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'IT',
    title: 'Platform Administrator',
    bio: 'Compte administrateur pour superviser la plateforme IT Social Network.',
    company: 'IT Social Network',
    location: 'Remote',
    website: 'https://example.com/admin',
    skills: ['Moderation', 'Security', 'Community'],
    experience: [
      {
        role: 'Platform Administrator',
        company: 'IT Social Network',
        period: '2026 - Aujourd’hui',
        description: 'Gestion des utilisateurs, contenus, missions et événements.',
      },
    ],
    education: [],
    portfolio: [],
  });

  const sarah = await upsertUser({
    email: 'sarah@example.com',
    username: 'sarahdev',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Ben Ali',
    title: 'DevOps Engineer',
    bio: 'J’aide les équipes à fiabiliser leurs déploiements cloud et leur observabilité.',
    company: 'CloudOps Studio',
    location: 'Remote',
    website: 'https://example.com/sarah',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    experience: [
      {
        role: 'DevOps Engineer',
        company: 'CloudOps Studio',
        period: '2021 - Aujourd’hui',
        description:
          'Industrialisation CI/CD, observabilité, infrastructure as code et plateformes Kubernetes.',
      },
    ],
    education: [
      {
        degree: 'AWS Solutions Architect',
        school: 'Amazon Web Services',
        period: '2022',
        description: 'Architecture cloud, sécurité et optimisation des coûts.',
      },
    ],
    portfolio: [
      {
        title: 'Playbook Observabilité',
        url: 'https://example.com/sarah/observability',
        description: 'Guide de mise en place logs, traces, métriques et alertes pour SaaS.',
      },
    ],
  });

  const malik = await upsertUser({
    email: 'malik@example.com',
    username: 'malikdata',
    password: 'password123',
    firstName: 'Malik',
    lastName: 'Trabelsi',
    title: 'Data Engineer',
    bio: 'Data engineer spécialisé dans les pipelines temps réel et les plateformes analytiques.',
    company: 'DataWorks',
    location: 'Paris, FR',
    website: 'https://example.com/malik',
    skills: ['Python', 'Kafka', 'dbt', 'BigQuery'],
    experience: [
      {
        role: 'Data Engineer',
        company: 'DataWorks',
        period: '2020 - Aujourd’hui',
        description:
          'Conception de pipelines data temps réel, modélisation analytique et plateformes cloud data.',
      },
    ],
    education: [
      {
        degree: 'Master Data Engineering',
        school: 'Université Paris Cité',
        period: '2018 - 2020',
        description: 'Systèmes distribués, data warehousing et machine learning appliqué.',
      },
    ],
    portfolio: [
      {
        title: 'Pipeline Kafka vers BigQuery',
        url: 'https://example.com/malik/kafka-bigquery',
        description: 'Architecture streaming pour ingestion et transformation de données produit.',
      },
    ],
  });

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: demo.id,
        followingId: sarah.id,
      },
    },
    update: {},
    create: {
      followerId: demo.id,
      followingId: sarah.id,
    },
  });

  const architecturePost = await findOrCreatePost({
    authorId: sarah.id,
    content:
      'Retour d’expérience: nous avons réduit le temps de déploiement de 40% en séparant les migrations DB du pipeline applicatif.',
  });

  const productPost = await findOrCreatePost({
    authorId: demo.id,
    content:
      'Je prépare un starter kit Next.js + Prisma pour accélérer les MVP SaaS. Quelles intégrations voulez-vous voir en premier ?',
  });

  await prisma.like.upsert({
    where: {
      postId_userId: {
        postId: architecturePost.id,
        userId: demo.id,
      },
    },
    update: {},
    create: {
      postId: architecturePost.id,
      userId: demo.id,
    },
  });

  await findOrCreateComment({
    postId: architecturePost.id,
    authorId: malik.id,
    content: 'Très intéressant. Vous avez automatisé le rollback des migrations ?',
  });

  await findOrCreateComment({
    postId: productPost.id,
    authorId: sarah.id,
    content: 'Un module CI/CD prêt pour Vercel et Railway serait très utile.',
  });

  const opportunity = await findOrCreateOpportunity({
    title: 'Développeur Next.js / Prisma pour MVP SaaS',
    company: 'Startup Studio',
    description:
      'Nous recherchons un freelance pour finaliser un MVP B2B: auth, dashboard, billing et intégrations API.',
    skills: ['Next.js', 'Prisma', 'PostgreSQL', 'Tailwind CSS'],
    budget: '450-600 EUR / jour',
    location: 'Remote Europe',
    remote: true,
    contractType: 'Mission freelance',
    authorId: demo.id,
  });

  await prisma.opportunityApplication.upsert({
    where: {
      opportunityId_applicantId: {
        opportunityId: opportunity.id,
        applicantId: sarah.id,
      },
    },
    update: {
      message: 'Disponible pour cadrer l’infrastructure et sécuriser les déploiements.',
    },
    create: {
      opportunityId: opportunity.id,
      applicantId: sarah.id,
      message: 'Disponible pour cadrer l’infrastructure et sécuriser les déploiements.',
    },
  });

  const event = await findOrCreateEvent({
    title: 'Meetup Observabilité en production',
    description:
      'Session pratique autour des logs, traces, métriques et alertes pour les applications web modernes.',
    location: 'En ligne',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    online: true,
    url: 'https://example.com/events/observability',
    organizerId: sarah.id,
  });

  await prisma.eventAttendee.upsert({
    where: {
      eventId_userId: {
        eventId: event.id,
        userId: demo.id,
      },
    },
    update: {},
    create: {
      eventId: event.id,
      userId: demo.id,
    },
  });

  const demoConversation = await findOrCreateConversation(demo.id, sarah.id);
  await findOrCreateMessage({
    conversationId: demoConversation.id,
    senderId: sarah.id,
    content: 'Salut Demo, ton starter SaaS Next.js m’intéresse beaucoup.',
    read: true,
  });
  await findOrCreateMessage({
    conversationId: demoConversation.id,
    senderId: demo.id,
    content: 'Merci Sarah ! Je prépare une version avec CI/CD et monitoring intégré.',
    read: true,
  });
  await findOrCreateMessage({
    conversationId: demoConversation.id,
    senderId: sarah.id,
    content: 'Parfait, je peux t’aider sur la partie observabilité.',
    read: false,
  });

  await prisma.notification.deleteMany({
    where: {
      type: { in: ['follow', 'comment', 'application', 'event_attendance', 'message'] },
      recipientId: { in: [demo.id, sarah.id] },
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        recipientId: demo.id,
        actorId: sarah.id,
        type: 'comment',
        message: 'Sarah Ben Ali a commenté votre publication.',
        link: `/profile/${demo.username}`,
        read: false,
      },
      {
        recipientId: demo.id,
        actorId: sarah.id,
        type: 'application',
        message: `Sarah Ben Ali a candidaté à "${opportunity.title}".`,
        link: `/marketplace/${opportunity.id}`,
        read: false,
      },
      {
        recipientId: sarah.id,
        actorId: demo.id,
        type: 'event_attendance',
        message: `Demo User participe à "${event.title}".`,
        link: `/events/${event.id}`,
        read: true,
      },
      {
        recipientId: demo.id,
        actorId: sarah.id,
        type: 'message',
        message: 'Sarah Ben Ali vous a envoyé un message.',
        link: `/messages?conversationId=${demoConversation.id}`,
        read: false,
      },
    ],
  });

  console.log('Seed data ready.');
  console.log('Demo login: demo@example.com / password123');
  console.log('Admin login: admin@example.com / admin123');
}

main()
  .catch((error) => {
    printSeedHelp(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
