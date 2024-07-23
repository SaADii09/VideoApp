import mongoose, { plugin, Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import { refreshAccessToken } from "../controllers/user.controller"

const commentScheme = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
)

commentScheme.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentScheme)
