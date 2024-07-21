import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { application } from "express";

const generateAccessAndRefreshTokens = async(userId);
{
    try {
        const user = await User.findOne(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while generating access and refresh token"
        );
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    console.log("email: ", email);
    //beginners methods not any issue
    //  if (fullName == "") {
    //     throw new ApiError(400, "fullName is required");
    // }

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() == ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exits");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverIamgeLocalPath = req.files?.coverImage[0]?.path;
    let coverIamgeLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverIamgeLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar image is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverIamgeLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "error during registering user");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "user registre successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    //get user detail from front-end
    // validation - not empty
    // compare password and username or email
    //asign access token & refresh token
    //*send cookies
    // return
    const { email, username, password } = req.body;
    if (!username || !email) {
        throw new ApiError(400, "username or password required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedinUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findOneAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return registerUser
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged out"));
});

export { registerUser, loginUser, logoutUser };
