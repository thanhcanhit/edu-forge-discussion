/* eslint-disable @typescript-eslint/no-unused-vars */
// seed.ts
import { PrismaClient, DiscussionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // =========================================================
  // Thread 1: Course Review với nhiều bài đăng và chuỗi reply
  // =========================================================

  // Tạo thread đánh giá khóa học
  const courseReviewThread = await prisma.thread.create({
    data: {
      type: DiscussionType.COURSE_REVIEW,
      courseId: 'course-101',
    },
  });

  // Tạo bài đăng chính có rating
  const post1 = await prisma.post.create({
    data: {
      threadId: courseReviewThread.id,
      authorId: 'userA',
      content:
        'Khóa học tuyệt vời! Tôi rất thích phong cách giảng dạy của giảng viên.',
      rating: 5,
    },
  });

  // Tạo reply cho bài đăng chính
  const reply1 = await prisma.post.create({
    data: {
      threadId: courseReviewThread.id,
      parentId: post1.id,
      authorId: 'userB',
      content: 'Đồng ý! Giảng viên rất nhiệt huyết và dễ hiểu.',
    },
  });

  // Tạo reply thứ hai cho bài đăng chính
  const reply2 = await prisma.post.create({
    data: {
      threadId: courseReviewThread.id,
      parentId: post1.id,
      authorId: 'userC',
      content: 'Mình thấy phần lý thuyết hơi dài, cần thêm ví dụ thực tế.',
    },
  });

  // Tạo nested reply cho reply2
  const nestedReply = await prisma.post.create({
    data: {
      threadId: courseReviewThread.id,
      parentId: reply2.id,
      authorId: 'userA',
      content: 'Cảm ơn góp ý, mình sẽ chuyển đến ban tổ chức.',
    },
  });

  // Tạo bài đăng thứ 2 (không reply)
  const post2 = await prisma.post.create({
    data: {
      threadId: courseReviewThread.id,
      authorId: 'userD',
      content: 'Khóa học hay nhưng tài liệu cần cập nhật thêm.',
      rating: 4,
    },
  });

  // =========================================================
  // Thread 2: Lesson Discussion với chuỗi reply kéo dài
  // =========================================================

  // Tạo thread bàn luận bài học
  const lessonDiscussionThread = await prisma.thread.create({
    data: {
      type: DiscussionType.LESSON_DISCUSSION,
      lessonId: 'lesson-202',
    },
  });

  // Tạo bài đăng chính cho bài học
  const lessonPost1 = await prisma.post.create({
    data: {
      threadId: lessonDiscussionThread.id,
      authorId: 'userE',
      content:
        'Bài học này khá khó hiểu, đặc biệt phần đệ quy. Có ai giải thích thêm không?',
    },
  });

  // Tạo reply cho bài đăng chính
  const lessonReply1 = await prisma.post.create({
    data: {
      threadId: lessonDiscussionThread.id,
      parentId: lessonPost1.id,
      authorId: 'userF',
      content: 'Thử hình dung đệ quy như là vòng lặp, mỗi lần gọi chính nó.',
    },
  });

  // Tạo nested reply cho lessonReply1
  const lessonNestedReply = await prisma.post.create({
    data: {
      threadId: lessonDiscussionThread.id,
      parentId: lessonReply1.id,
      authorId: 'userG',
      content: 'Ý kiến hay, mình cũng đã học theo cách đó và thấy hiệu quả.',
    },
  });

  // Tạo thêm reply cho bài đăng chính
  const lessonReply2 = await prisma.post.create({
    data: {
      threadId: lessonDiscussionThread.id,
      parentId: lessonPost1.id,
      authorId: 'userH',
      content:
        'Mình có một video giải thích rất chi tiết, các bạn có thể tham khảo!',
    },
  });

  // =========================================================
  // Thread 3: Course Review với một bài đăng đơn giản (không reply)
  // =========================================================

  const singlePostCourseReviewThread = await prisma.thread.create({
    data: {
      type: DiscussionType.COURSE_REVIEW,
      courseId: 'course-303',
    },
  });

  const singlePost = await prisma.post.create({
    data: {
      threadId: singlePostCourseReviewThread.id,
      authorId: 'userI',
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
      type: DiscussionType.LESSON_DISCUSSION,
      lessonId: 'lesson-404',
    },
  });

  const lessonPost2 = await prisma.post.create({
    data: {
      threadId: multiplePostsLessonDiscussionThread.id,
      authorId: 'userJ',
      content: 'Bài học này rất rõ ràng, mình hiểu ngay lập tức.',
    },
  });

  const lessonPost3 = await prisma.post.create({
    data: {
      threadId: multiplePostsLessonDiscussionThread.id,
      authorId: 'userK',
      content:
        'Mình có chút băn khoăn ở phần kết thúc, ai có thể giải thích thêm không?',
    },
  });

  // =========================================================
  // Tạo Like cho các bài đăng
  // =========================================================

  // Like cho bài đăng chính của Thread 1
  await prisma.like.createMany({
    data: [
      { postId: post1.id, userId: 'userL' },
      { postId: post1.id, userId: 'userM' },
      { postId: post1.id, userId: 'userN' },
    ],
  });

  // Like cho bài đăng chính của Thread 2
  await prisma.like.create({
    data: { postId: lessonPost1.id, userId: 'userO' },
  });

  // Like cho từng bài đăng của Thread 4
  await prisma.like.create({
    data: { postId: lessonPost2.id, userId: 'user_like_userJ' },
  });
  await prisma.like.create({
    data: { postId: lessonPost3.id, userId: 'user_like_userK' },
  });

  // =========================================================
  // Ví dụ về soft delete: tạo một post rồi soft delete
  // =========================================================

  await prisma.post.create({
    data: {
      threadId: courseReviewThread.id,
      authorId: 'userP',
      content: 'Bài đăng này sẽ được soft delete.',
      rating: 3,
      deletedAt: new Date(), // Soft delete ngay khi tạo
    },
  });

  console.log('Đã tạo dữ liệu mẫu đa dạng cho microservice thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
