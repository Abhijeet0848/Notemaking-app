# ☁️ Cloud APK Build Guide

I have added an "Automation Script" (a GitHub Actions Workflow) to your project. This script will build your `.apk` file for you in the cloud for free.

## 🚀 How to get your .apk file:

### Step 1: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com) and log in.
2. Click **New** to create a new repository.
3. Give it a name (e.g., `notemaking-app`) and click **Create repository**.

### Step 2: Upload your files
The easiest way is to use the **GitHub website directly**:
1. In your new repository, click **"uploading an existing file"**.
2. **CRITICAL**: You must upload the **`.github`** folder. 
   - *Note*: In Windows, this folder is often **HIDDEN**. To see it, open your folder, click **View** at the top, and check **[x] Hidden items**.
3. Drag and drop **everything** inside your `d:\Notemaking` folder EXCEPT `node_modules`.
4. Make sure the folder structure on GitHub looks like this:
   - `.github/workflows/android_build.yml`
5. Click **Commit changes**.

### Branch Name Tip
- My script looks for a branch named `main` or `master`. If your GitHub repository's default branch is different (you can see it in the top-left dropdown on GitHub), the workflow won't start. 
- You can manually start it: Go to **Actions** > **Build Android APK** > **Run workflow**.


### Step 3: Wait for the Build
1. Once you upload the files, go to the **"Actions"** tab at the top of your GitHub repository.
2. You will see a workflow named **"Build Android APK"** running. 
3. Wait about 3-5 minutes for it to turn **green (✅)**.

### Step 4: Download your APK
1. Click on the completed "Build Android APK" run.
2. Scroll down to the **"Artifacts"** section at the bottom.
3. Click on **`app-debug-apk`** to download your official Android APK file!

## 🎁 Done!
You can now send this `.apk` file to your phone and install it.

> [!TIP]
> This method is professional and ensures your APK is built exactly as it would be in Android Studio, but without needing any software on your machine.
