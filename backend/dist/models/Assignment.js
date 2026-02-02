"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assignment = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Assignment extends sequelize_1.Model {
    isOverdue() {
        if (!this.due_date)
            return false;
        return new Date() > this.due_date;
    }
    getDaysLate() {
        if (!this.due_date || !this.isOverdue())
            return 0;
        const diffTime = Math.abs(new Date().getTime() - this.due_date.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    canSubmit() {
        if (!this.is_published)
            return false;
        if (!this.due_date)
            return true;
        if (!this.isOverdue())
            return true;
        return this.allow_late_submission && this.getDaysLate() <= this.max_late_days;
    }
    getLatePenalty() {
        if (!this.isOverdue() || !this.allow_late_submission)
            return 0;
        const daysLate = this.getDaysLate();
        if (daysLate > this.max_late_days)
            return 100;
        return Math.min(daysLate * this.late_penalty_per_day, 100);
    }
}
exports.Assignment = Assignment;
Assignment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    class_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'classes',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    title: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: {
                args: [1, 255],
                msg: 'Assignment title must be between 1 and 255 characters'
            },
            notEmpty: {
                msg: 'Assignment title cannot be empty'
            }
        }
    },
    problem_description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: {
                args: [1, 10000],
                msg: 'Problem description must be between 1 and 10000 characters'
            },
            notEmpty: {
                msg: 'Problem description cannot be empty'
            }
        }
    },
    language: {
        type: sequelize_1.DataTypes.ENUM('c', 'cpp', 'java', 'python', 'javascript'),
        allowNull: false,
        defaultValue: 'c'
    },
    time_limit: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5000,
        validate: {
            min: {
                args: [100],
                msg: 'Time limit must be at least 100ms'
            },
            max: {
                args: [30000],
                msg: 'Time limit must be 30 seconds or less'
            }
        }
    },
    memory_limit: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 128,
        validate: {
            min: {
                args: [16],
                msg: 'Memory limit must be at least 16MB'
            },
            max: {
                args: [512],
                msg: 'Memory limit must be 512MB or less'
            }
        }
    },
    total_points: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
        validate: {
            min: {
                args: [1],
                msg: 'Total points must be at least 1'
            },
            max: {
                args: [1000],
                msg: 'Total points must be 1000 or less'
            }
        }
    },
    due_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        validate: {
            isAfterNow(value) {
                if (value && value <= new Date()) {
                    throw new Error('Due date must be in the future');
                }
            }
        }
    },
    allow_late_submission: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    late_penalty_per_day: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10.0,
        validate: {
            min: {
                args: [0],
                msg: 'Late penalty must be 0 or greater'
            },
            max: {
                args: [100],
                msg: 'Late penalty cannot exceed 100%'
            }
        }
    },
    max_late_days: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: 'Max late days must be 0 or greater'
            },
            max: {
                args: [30],
                msg: 'Max late days cannot exceed 30'
            }
        }
    },
    is_published: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    published_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'Assignment',
    tableName: 'assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['class_id']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['title']
        },
        {
            fields: ['due_date']
        },
        {
            fields: ['is_published']
        }
    ],
    hooks: {
        beforeValidate: (assignment) => {
            if (assignment.title) {
                assignment.title = assignment.title.trim();
            }
            if (assignment.problem_description) {
                assignment.problem_description = assignment.problem_description.trim();
            }
        }
    }
});
exports.default = Assignment;
//# sourceMappingURL=Assignment.js.map