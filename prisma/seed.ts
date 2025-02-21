/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
// seed.ts
import {
  PrismaClient,
  DiscussionType,
  ReactionType,
  type Reaction,
  type Post,
  type Thread,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Generate proper UUID v4 format strings for all entities
const UUIDS = {
  // Users
  users: {
    A: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    B: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    C: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    D: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    E: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    F: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    G: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    H: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
    I: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
    J: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
    K: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    L: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    M: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    N: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    O: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25',
    P: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
  },
  // Courses
  courses: {
    course101: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11',
    course303: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12',
  },
  // Lessons
  lessons: {
    lesson202: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11',
    lesson404: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f12',
  },
  // Threads
  threads: {
    courseReview: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
    lessonDiscussion: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12',
    singlePostReview: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13',
    multiplePostsDiscussion: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14',
  },
  // Posts
  posts: {
    post1: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11',
    reply1: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12',
    reply2: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13',
    nestedReply: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c14',
    post2: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c15',
    lessonPost1: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c16',
    lessonReply1: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c17',
    lessonNestedReply: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c18',
    lessonReply2: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c19',
    singlePost: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c20',
    lessonPost2: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c21',
    lessonPost3: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c22',
    softDeletedPost: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c23',
  },
  // Reactions
  reactions: {
    like1: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11',
    like2: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12',
    love1: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d13',
    wow1: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d14',
    haha1: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d15',
    care1: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d16',
  },
} as const;

// Interfaces for type safety
interface SeedThreadInput {
  threadId: string;
  type: DiscussionType;
  resourceId: string;
  posts: Array<{
    id: string;
    authorId: string;
    content: string;
    rating?: number;
    parentId?: string;
    deletedAt?: Date;
  }>;
  overallRating?: number;
}

interface SeedReactionInput {
  id: string;
  postId: string;
  userId: string;
  type: ReactionType;
}

async function cleanup() {
  try {
    await prisma.$transaction([
      prisma.reaction.deleteMany(),
      prisma.post.deleteMany(),
      prisma.thread.deleteMany(),
    ]);
    console.log('🧹 Cleaned up existing data');
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

// Type-safe reaction creator
async function createReaction(data: {
  id: string;
  postId: string;
  userId: string;
  type: ReactionType;
}): Promise<Reaction> {
  return await prisma.reaction.create({
    data: {
      id: data.id,
      postId: data.postId,
      userId: data.userId,
      type: data.type,
    },
  });
}

async function seedThread({
  threadId,
  type,
  resourceId,
  posts,
  overallRating,
}: SeedThreadInput): Promise<Thread> {
  // Tạo thread
  const thread = await prisma.thread.create({
    data: {
      id: threadId,
      type,
      resourceId,
      overallRating,
    },
  });

  // Tạo tất cả bài đăng bằng createMany
  await prisma.post.createMany({
    data: posts.map((post) => ({
      id: post.id,
      threadId: thread.id,
      authorId: post.authorId,
      content: post.content,
      rating: post.rating,
      parentId: post.parentId,
      deletedAt: post.deletedAt,
    })),
  });

  return thread;
}

async function seedReactions(reactions: SeedReactionInput[]) {
  await prisma.reaction.createMany({
    data: reactions,
  });
}

async function calculateOverallRating(
  threadId: string,
): Promise<number | null> {
  const posts = await prisma.post.findMany({
    where: {
      threadId,
      parentId: null, // Chỉ lấy bài đăng chính
      deletedAt: null, // Không tính bài đã xóa
    },
    select: { rating: true },
  });

  const ratings = posts
    .map((p) => p.rating)
    .filter((r): r is number => r !== null);

  return ratings.length > 0
    ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
    : null;
}

async function main() {
  await cleanup();

  // =========================================================
  // Thread 1: Course Review với nhiều bài đăng và chuỗi reply
  // =========================================================
  const courseReviewThread = await seedThread({
    threadId: UUIDS.threads.courseReview,
    type: DiscussionType.COURSE_REVIEW,
    resourceId: UUIDS.courses.course101,
    posts: [
      {
        id: UUIDS.posts.post1,
        authorId: UUIDS.users.A,
        content: 'Khóa học tuyệt vời! Phong cách giảng dạy rất cuốn hút.',
        rating: 5.0,
      },
      {
        id: UUIDS.posts.reply1,
        parentId: UUIDS.posts.post1,
        authorId: UUIDS.users.B,
        content: 'Đồng ý! Giảng viên rất nhiệt huyết và dễ hiểu.',
      },
      {
        id: UUIDS.posts.reply2,
        parentId: UUIDS.posts.post1,
        authorId: UUIDS.users.C,
        content: 'Phần lý thuyết hơi dài, cần thêm ví dụ thực tế.',
      },
      {
        id: UUIDS.posts.nestedReply,
        parentId: UUIDS.posts.reply2,
        authorId: UUIDS.users.A,
        content: 'Cảm ơn góp ý, mình sẽ chuyển đến ban tổ chức.',
      },
      {
        id: UUIDS.posts.post2,
        authorId: UUIDS.users.D,
        content: 'Khóa học hay nhưng tài liệu cần cập nhật thêm.',
        rating: 4.5,
      },
      {
        id: UUIDS.posts.softDeletedPost,
        authorId: UUIDS.users.P,
        content: 'Bài đăng này sẽ được soft delete.',
        rating: 3.0,
        deletedAt: new Date(),
      },
    ],
  });

  // Cập nhật overallRating cho Thread 1
  const overallRating1 = await calculateOverallRating(courseReviewThread.id);
  if (overallRating1 !== null) {
    await prisma.thread.update({
      where: { id: courseReviewThread.id },
      data: { overallRating: overallRating1 },
    });
  }

  // =========================================================
  // Thread 2: Lesson Discussion với chuỗi reply
  // =========================================================
  await seedThread({
    threadId: UUIDS.threads.lessonDiscussion,
    type: DiscussionType.LESSON_DISCUSSION,
    resourceId: UUIDS.lessons.lesson202,
    posts: [
      {
        id: UUIDS.posts.lessonPost1,
        authorId: UUIDS.users.E,
        content:
          'Bài học này khó hiểu, đặc biệt phần đệ quy. Ai giải thích thêm không?',
      },
      {
        id: UUIDS.posts.lessonReply1,
        parentId: UUIDS.posts.lessonPost1,
        authorId: UUIDS.users.F,
        content: 'Thử hình dung đệ quy như vòng lặp, mỗi lần gọi chính nó.',
      },
      {
        id: UUIDS.posts.lessonNestedReply,
        parentId: UUIDS.posts.lessonReply1,
        authorId: UUIDS.users.G,
        content: 'Ý kiến hay, mình học theo cách đó và thấy hiệu quả.',
      },
      {
        id: UUIDS.posts.lessonReply2,
        parentId: UUIDS.posts.lessonPost1,
        authorId: UUIDS.users.H,
        content: 'Mình có video giải thích chi tiết, các bạn tham khảo nhé!',
      },
    ],
  });

  // =========================================================
  // Thread 3: Course Review với một bài đăng
  // =========================================================
  const singlePostReviewThread = await seedThread({
    threadId: UUIDS.threads.singlePostReview,
    type: DiscussionType.COURSE_REVIEW,
    resourceId: UUIDS.courses.course303,
    posts: [
      {
        id: UUIDS.posts.singlePost,
        authorId: UUIDS.users.I,
        content: 'Khóa học quá lý thuyết, thiếu thực hành.',
        rating: 2.0,
      },
    ],
    overallRating: 2.0, // Chỉ có một bài đánh giá nên overallRating = rating
  });

  // =========================================================
  // Thread 4: Lesson Discussion với nhiều bài đăng độc lập
  // =========================================================
  await seedThread({
    threadId: UUIDS.threads.multiplePostsDiscussion,
    type: DiscussionType.LESSON_DISCUSSION,
    resourceId: UUIDS.lessons.lesson404,
    posts: [
      {
        id: UUIDS.posts.lessonPost2,
        authorId: UUIDS.users.J,
        content: 'Bài học này rất rõ ràng, mình hiểu ngay lập tức.',
      },
      {
        id: UUIDS.posts.lessonPost3,
        authorId: UUIDS.users.K,
        content: 'Mình băn khoăn phần kết thúc, ai giải thích thêm không?',
      },
    ],
  });

  // =========================================================
  // Seed phản ứng
  // =========================================================
  await seedReactions([
    {
      id: UUIDS.reactions.like1,
      postId: UUIDS.posts.post1,
      userId: UUIDS.users.L,
      type: ReactionType.LIKE,
    },
    {
      id: UUIDS.reactions.love1,
      postId: UUIDS.posts.post1,
      userId: UUIDS.users.M,
      type: ReactionType.LOVE,
    },
    {
      id: UUIDS.reactions.care1,
      postId: UUIDS.posts.post1,
      userId: UUIDS.users.N,
      type: ReactionType.CARE,
    },
    {
      id: UUIDS.reactions.wow1,
      postId: UUIDS.posts.lessonPost1,
      userId: UUIDS.users.O,
      type: ReactionType.WOW,
    },
    {
      id: UUIDS.reactions.like2,
      postId: UUIDS.posts.lessonPost2,
      userId: UUIDS.users.J,
      type: ReactionType.LIKE,
    },
    {
      id: UUIDS.reactions.haha1,
      postId: UUIDS.posts.lessonPost3,
      userId: UUIDS.users.K,
      type: ReactionType.HAHA,
    },
  ]);

  console.log('✅ Đã tạo dữ liệu mẫu thành công!');
  console.log('🔑 Thông tin chính:');
  console.log(
    `- Thread 1 (Course Review): ID=${courseReviewThread.id}, Overall Rating=${overallRating1}`,
  );
  console.log(
    `- Thread 2 (Lesson Discussion): ID=${UUIDS.threads.lessonDiscussion}`,
  );
  console.log(
    `- Thread 3 (Single Post Review): ID=${singlePostReviewThread.id}, Overall Rating=2.0`,
  );
  console.log(
    `- Thread 4 (Multiple Posts Discussion): ID=${UUIDS.threads.multiplePostsDiscussion}`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
