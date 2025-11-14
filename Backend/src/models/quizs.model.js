import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      unique : false
    },
    lastAttempted: {
      type: Date,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
        },
        choices: [
          {
            text: {
              type: String,
              required: true,
            },
            isCorrect: {
              type: Boolean,
              required: true,
            },
            userAnswer: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
    attempted: {
      type: Boolean,
      default: false,
      required: true,
    },
    quizType: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
