"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestData = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const Class_1 = require("../models/Class");
const Assignment_1 = require("../models/Assignment");
const TestCase_1 = require("../models/TestCase");
const Enrollment_1 = require("../models/Enrollment");
const createTestData = async () => {
    try {
        console.log('Creating test data...');
        const hashedPassword = await bcrypt_1.default.hash('password123', 10);
        const teacher = await User_1.User.findOrCreate({
            where: { email: 'teacher@codeforge.dev' },
            defaults: {
                name: 'John Teacher',
                email: 'teacher@codeforge.dev',
                password_hash: hashedPassword,
                role: 'teacher'
            }
        });
        const student1 = await User_1.User.findOrCreate({
            where: { email: 'student1@codeforge.dev' },
            defaults: {
                name: 'Alice Student',
                email: 'student1@codeforge.dev',
                password_hash: hashedPassword,
                role: 'student'
            }
        });
        const student2 = await User_1.User.findOrCreate({
            where: { email: 'student2@codeforge.dev' },
            defaults: {
                name: 'Bob Student',
                email: 'student2@codeforge.dev',
                password_hash: hashedPassword,
                role: 'student'
            }
        });
        const sampleClass = await Class_1.Class.findOrCreate({
            where: { name: 'Introduction to C Programming' },
            defaults: {
                teacher_id: teacher[0].id,
                name: 'Introduction to C Programming',
                description: 'Learn the fundamentals of C programming language',
                visibility: 'public',
                join_method: 'code',
                join_code: 'C101ABCD',
                max_students: 30,
                is_active: true
            }
        });
        await Enrollment_1.Enrollment.findOrCreate({
            where: {
                student_id: student1[0].id,
                class_id: sampleClass[0].id
            },
            defaults: {
                student_id: student1[0].id,
                class_id: sampleClass[0].id,
                status: 'active',
                enrolled_by: teacher[0].id
            }
        });
        await Enrollment_1.Enrollment.findOrCreate({
            where: {
                student_id: student2[0].id,
                class_id: sampleClass[0].id
            },
            defaults: {
                student_id: student2[0].id,
                class_id: sampleClass[0].id,
                status: 'active',
                enrolled_by: teacher[0].id
            }
        });
        const sampleAssignment = await Assignment_1.Assignment.findOrCreate({
            where: { title: 'Hello World Program' },
            defaults: {
                class_id: sampleClass[0].id,
                title: 'Hello World Program',
                problem_description: 'Write a C program that prints "Hello, World!" to the console.\n\nRequirements:\n- Use printf() function\n- Include proper headers\n- Program should compile without warnings',
                language: 'c',
                time_limit: 5000,
                memory_limit: 128,
                total_points: 100,
                is_published: true,
                published_at: new Date()
            }
        });
        await TestCase_1.TestCase.findOrCreate({
            where: {
                assignment_id: sampleAssignment[0].id,
                input: ''
            },
            defaults: {
                assignment_id: sampleAssignment[0].id,
                input: '',
                expected_output: 'Hello, World!',
                is_hidden: false,
                points: 50,
                time_limit: 5000,
                memory_limit: 128
            }
        });
        await TestCase_1.TestCase.findOrCreate({
            where: {
                assignment_id: sampleAssignment[0].id,
                input: '',
                expected_output: 'Hello, World!'
            },
            defaults: {
                assignment_id: sampleAssignment[0].id,
                input: '',
                expected_output: 'Hello, World!',
                is_hidden: true,
                points: 50,
                time_limit: 5000,
                memory_limit: 128
            }
        });
        console.log('Test data created successfully');
        console.log(`   Teacher: ${teacher[0].email} (${teacher[0].name})`);
        console.log(`   Student 1: ${student1[0].email} (${student1[0].name})`);
        console.log(`   Student 2: ${student2[0].email} (${student2[0].name})`);
        console.log(`   Sample Class: ${sampleClass[0].name} (Join Code: ${sampleClass[0].join_code})`);
        console.log(`   Sample Assignment: ${sampleAssignment[0].title} (${sampleAssignment[0].total_points} points)`);
    }
    catch (error) {
        console.error('Error creating test data:', error);
        throw error;
    }
};
exports.createTestData = createTestData;
//# sourceMappingURL=createTestData.js.map