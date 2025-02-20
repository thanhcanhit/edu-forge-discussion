/* eslint-disable @typescript-eslint/no-unused-vars */
// seed.ts
import { PrismaClient, DiscussionType, ReactionType } from '@prisma/client';

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

async function cleanup() {
  // Clean up existing data in reverse order of dependencies
  await prisma.reaction.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.thread.deleteMany({});

  console.log('🧹 Cleaned up existing data');
}

async function main() {
  // Clean up existing data first
  await cleanup();

  // =========================================================
  // Thread 1: Course Review với nhiều bài đăng và chuỗi reply
  // =========================================================

  // Tạo thread đánh giá khóa học
  const courseReviewThread = await prisma.thread.create({
    data: {
      id: UUIDS.threads.courseReview,
      type: DiscussionType.COURSE_REVIEW,
      courseId: UUIDS.courses.course101,
    },
  });

  // Tạo bài đăng chính có rating
  const post1 = await prisma.post.create({
    data: {
      id: UUIDS.posts.post1,
      threadId: courseReviewThread.id,
      authorId: UUIDS.users.A,
      content:
        'Khóa học tuyệt vời! Tôi rất thích phong cách giảng dạy của giảng viên.',
      rating: 5,
    },
  });

  // Tạo reply cho bài đăng chính
  await prisma.post.create({
    data: {
      id: UUIDS.posts.reply1,
      threadId: courseReviewThread.id,
      parentId: post1.id,
      authorId: UUIDS.users.B,
      content: 'Đồng ý! Giảng viên rất nhiệt huyết và dễ hiểu.',
    },
  });

  // Tạo reply thứ hai cho bài đăng chính
  const reply2 = await prisma.post.create({
    data: {
      id: UUIDS.posts.reply2,
      threadId: courseReviewThread.id,
      parentId: post1.id,
      authorId: UUIDS.users.C,
      content: 'Mình thấy phần lý thuyết hơi dài, cần thêm ví dụ thực tế.',
    },
  });

  // Tạo nested reply cho reply2
  await prisma.post.create({
    data: {
      id: UUIDS.posts.nestedReply,
      threadId: courseReviewThread.id,
      parentId: reply2.id,
      authorId: UUIDS.users.A,
      content: 'Cảm ơn góp ý, mình sẽ chuyển đến ban tổ chức.',
    },
  });

  // Tạo bài đăng thứ 2 (không reply)
  await prisma.post.create({
    data: {
      id: UUIDS.posts.post2,
      threadId: courseReviewThread.id,
      authorId: UUIDS.users.D,
      content: 'Khóa học hay nhưng tài liệu cần cập nhật thêm.',
      rating: 4,
    },
  });

  // =========================================================
  // Thread 2: Lesson Discussion với chuỗi reply kéo dài
  // =========================================================

  const lessonDiscussionThread = await prisma.thread.create({
    data: {
      id: UUIDS.threads.lessonDiscussion,
      type: DiscussionType.LESSON_DISCUSSION,
      lessonId: UUIDS.lessons.lesson202,
    },
  });

  // Tạo bài đăng chính cho bài học
  const lessonPost1 = await prisma.post.create({
    data: {
      id: UUIDS.posts.lessonPost1,
      threadId: lessonDiscussionThread.id,
      authorId: UUIDS.users.E,
      content:
        'Bài học này khá khó hiểu, đặc biệt phần đệ quy. Có ai giải thích thêm không?',
    },
  });

  // Tạo reply cho bài đăng chính
  const lessonReply1 = await prisma.post.create({
    data: {
      id: UUIDS.posts.lessonReply1,
      threadId: lessonDiscussionThread.id,
      parentId: lessonPost1.id,
      authorId: UUIDS.users.F,
      content: 'Thử hình dung đệ quy như là vòng lặp, mỗi lần gọi chính nó.',
    },
  });

  // Tạo nested reply cho lessonReply1
  await prisma.post.create({
    data: {
      id: UUIDS.posts.lessonNestedReply,
      threadId: lessonDiscussionThread.id,
      parentId: lessonReply1.id,
      authorId: UUIDS.users.G,
      content: 'Ý kiến hay, mình cũng đã học theo cách đó và thấy hiệu quả.',
    },
  });

  // Tạo thêm reply cho bài đăng chính
  await prisma.post.create({
    data: {
      id: UUIDS.posts.lessonReply2,
      threadId: lessonDiscussionThread.id,
      parentId: lessonPost1.id,
      authorId: UUIDS.users.H,
      content:
        'Mình có một video giải thích rất chi tiết, các bạn có thể tham khảo!',
    },
  });

  // =========================================================
  // Thread 3: Course Review với một bài đăng đơn giản (không reply)
  // =========================================================

  const singlePostCourseReviewThread = await prisma.thread.create({
    data: {
      id: UUIDS.threads.singlePostReview,
      type: DiscussionType.COURSE_REVIEW,
      courseId: UUIDS.courses.course303,
    },
  });

  await prisma.post.create({
    data: {
      id: UUIDS.posts.singlePost,
      threadId: singlePostCourseReviewThread.id,
      authorId: UUIDS.users.I,
      content:
        'Tôi không thích khóa học này vì quá lý thuyết và thiếu thực hành.',
      rating: 2,
    },
  });

  // =========================================================
  // Thread 4: Lesson Discussion với nhiều bài đăng độc lập
  // =========================================================

  const multiplePostsLessonDiscussionThread = await prisma.thread.create({
    data: {
      id: UUIDS.threads.multiplePostsDiscussion,
      type: DiscussionType.LESSON_DISCUSSION,
      lessonId: UUIDS.lessons.lesson404,
    },
  });

  const lessonPost2 = await prisma.post.create({
    data: {
      id: UUIDS.posts.lessonPost2,
      threadId: multiplePostsLessonDiscussionThread.id,
      authorId: UUIDS.users.J,
      content: 'Bài học này rất rõ ràng, mình hiểu ngay lập tức.',
    },
  });

  const lessonPost3 = await prisma.post.create({
    data: {
      id: UUIDS.posts.lessonPost3,
      threadId: multiplePostsLessonDiscussionThread.id,
      authorId: UUIDS.users.K,
      content:
        'Mình có chút băn khoăn ở phần kết thúc, ai có thể giải thích thêm không?',
    },
  });

  // =========================================================
  // Tạo Reaction cho các bài đăng
  // =========================================================

  // Reactions cho bài đăng chính của Thread 1
  await prisma.reaction.create({
    data: {
      id: UUIDS.reactions.like1,
      postId: post1.id,
      userId: UUIDS.users.L,
      type: ReactionType.LIKE,
    },
  });
  await prisma.reaction.create({
    data: {
      id: UUIDS.reactions.love1,
      postId: post1.id,
      userId: UUIDS.users.M,
      type: ReactionType.LOVE,
    },
  });
  await prisma.reaction.create({
    data: {
      id: UUIDS.reactions.care1,
      postId: post1.id,
      userId: UUIDS.users.N,
      type: ReactionType.CARE,
    },
  });

  // Reaction cho bài đăng chính của Thread 2
  await prisma.reaction.create({
    data: {
      id: UUIDS.reactions.wow1,
      postId: lessonPost1.id,
      userId: UUIDS.users.O,
      type: ReactionType.WOW,
    },
  });

  // Reactions cho từng bài đăng của Thread 4
  await prisma.reaction.create({
    data: {
      id: UUIDS.reactions.like2,
      postId: lessonPost2.id,
      userId: UUIDS.users.J,
      type: ReactionType.LIKE,
    },
  });
  await prisma.reaction.create({
    data: {
      id: UUIDS.reactions.haha1,
      postId: lessonPost3.id,
      userId: UUIDS.users.K,
      type: ReactionType.HAHA,
    },
  });

  // =========================================================
  // Ví dụ về soft delete: tạo một post rồi soft delete
  // =========================================================

  await prisma.post.create({
    data: {
      id: UUIDS.posts.softDeletedPost,
      threadId: courseReviewThread.id,
      authorId: UUIDS.users.P,
      content: 'Bài đăng này sẽ được soft delete.',
      rating: 3,
      deletedAt: new Date(), // Soft delete ngay khi tạo
    },
  });

  console.log('✅ Đã tạo dữ liệu mẫu đa dạng cho microservice thành công!');
  // Log một số UUID để tham khảo sau này
  console.log('🔑 Sample UUIDs for reference:');
  console.log('Thread 1:', UUIDS.threads.courseReview);
  console.log('Post 1:', UUIDS.posts.post1);
  console.log('User A:', UUIDS.users.A);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
