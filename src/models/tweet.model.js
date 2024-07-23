import mongoose, { Schema } from "mongoose"

const tweetSchema = new Schema(
    {
        content : {type:String,
            required:true
        },
        owner: {
            type: Schema.types.objectId,
            ref:"Tweet"
        },
    },
    {
        timestamps: true,
    }
)
