const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function upsertUser(user) {
  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      bio: user.bio,
      company: user.company,
      location: user.location,
      website: user.website,
      skills: user.skills,
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

async function main() {
  const demo = await upsertUser({
    email: 'demo@example.com',
    username: 'demo',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'User',
    title: 'Full Stack Developer',
    bio: 'Développeur full stack passionné par les produits SaaS, Next.js et PostgreSQL.',
    company: 'IT Social Network',
    location: 'Tunis, TN',
    website: 'https://example.com',
    skills: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
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

  console.log('Seed data ready.');
  console.log('Demo login: demo@example.com / password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
