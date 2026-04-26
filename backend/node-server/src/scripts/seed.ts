import mongoose from 'mongoose'
import { env } from '../config/env'
import { QuestionEntity } from '../models/Question'
import { DesignQuestionEntity } from '../models/DesignQuestion'

const codingQuestions = [
  {
    title: 'Two Sum',
    difficulty: 'easy',
    tags: ['array', 'hashing'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    constraints: ['2 <= nums.length <= 1e4', '-1e9 <= nums[i] <= 1e9'],
    sampleInput: 'nums = [2,7,11,15], target = 9',
    sampleOutput: '[0,1]',
    visibleTests: [{ input: '4\n2 7 11 15\n9\n', output: '0 1' }],
    hiddenTests: [{ input: '3\n3 2 4\n6\n', output: '1 2' }],
    source: 'curated'
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'easy',
    tags: ['stack', 'string'],
    description: 'Given a string s containing characters (), {}, [], determine if the input string is valid.',
    constraints: ['1 <= s.length <= 1e4'],
    sampleInput: '()[]{}',
    sampleOutput: 'true',
    visibleTests: [{ input: '()[]{}\n', output: 'true' }],
    hiddenTests: [{ input: '([{}])\n', output: 'true' }],
    source: 'curated'
  },
  {
    title: 'Merging Intervals',
    difficulty: 'medium',
    tags: ['array', 'sorting'],
    description: 'Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals.',
    constraints: ['1 <= intervals.length <= 1e4'],
    sampleInput: '[[1,3],[2,6],[8,10]]',
    sampleOutput: '[[1,6],[8,10]]',
    visibleTests: [{ input: '3\n1 3\n2 6\n8 10\n', output: '1 6\n8 10' }],
    hiddenTests: [{ input: '2\n1 4\n2 3\n', output: '1 4' }],
    source: 'curated'
  }
]

const designQuestions = [
  {
    title: 'Design Twitter',
    description: 'Design a social media service where users can post tweets, follow others, and view a timeline of tweets.',
    focusAreas: ['Scalability', 'Feed Generation', 'Fan-out'],
    difficulty: 'hard'
  },
  {
    title: 'Design URL Shortener',
    description: 'Design a service like Bitly that converts long URLs into short 7-character aliases.',
    focusAreas: ['Availability', 'Caching', 'ID Generation'],
    difficulty: 'medium'
  },
  {
    title: 'Design WhatsApp',
    description: 'Design a real-time messaging service that supports one-on-one and group chats with read receipts.',
    focusAreas: ['Real-time', 'WebSockets', 'Persistence'],
    difficulty: 'hard'
  }
]

async function seed() {
  try {
    if (!env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment.')
    }
    await mongoose.connect(env.MONGODB_URI)
    console.log('Connected to MongoDB for seeding...')

    await QuestionEntity.deleteMany({ source: 'curated' })
    await QuestionEntity.insertMany(codingQuestions)
    console.log('Seeded coding questions.')

    await DesignQuestionEntity.deleteMany({})
    await DesignQuestionEntity.insertMany(designQuestions)
    console.log('Seeded design questions.')

    await mongoose.disconnect()
    console.log('Seeding complete.')
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()
