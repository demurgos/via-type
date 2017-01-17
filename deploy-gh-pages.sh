#!/bin/bash
# bash is required (instead of a simple POSIX shell) for substitutions

# Exit with nonzero exit code if anything fails
set -e

echo "Starting deployment"

SOURCE_BRANCH="docs"
TARGET_BRANCH="gh-pages"
GH_PAGES_DIRECTORY="dist/gh-pages/"

## Pull requests shouldn't try to deploy
#if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
#    echo "Skipping deploy, this is only Pull Request."
#    exit 0
#fi
#
## Commits to other branches shouldn't try to deploy
#if [ "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
#    echo "Skipping deploy, not on the source branch ($SOURCE_BRANCH)."
#    exit 0
#fi

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
HTTPS_REPO=${REPO/git@github.com:/https:\/\/github.com\/}
SHA=`git rev-parse --verify HEAD`

# Clean out existing gh-pages
rm -rf $GH_PAGES_DIRECTORY

# Clone repo, checkout gh-pages branch and clean it
git clone $HTTPS_REPO $GH_PAGES_DIRECTORY
cd $GH_PAGES_DIRECTORY
# Create a new empty branch if gh-pages doesn't exist yet (should only happen on first deploy)
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
git rm -f '**'
# Return to previous directory (project root)
cd -

# Build gh-pages
npm run gh-pages

# Configure git
cd $GH_PAGES_DIRECTORY
git config user.name "Travis CI"
git config user.email "demurgos@demurgos.net"

# Ensure that the files are added
git add .

# If there are no changes (empty string for `git status --porcelain`) then just bail.
if [ -z "$(git status --porcelain)" ]; then
    echo "No changes to gh-pages, exiting."
    exit 0
fi

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git commit -m "Deploy to Github Pages: ${SHA}"

# Decrypt and add the deployment key
cd -
# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
openssl aes-256-cbc -K $encrypted_2e39dacc7180_key -iv $encrypted_2e39dacc7180_iv -in deploy_key.enc -out deploy_key -d
# Start SSH
eval `ssh-agent -s`
# Reduce the access of the deploy key, or it will be rejected by ssh-add
chmod 600 deploy_key
# Add the key
ssh-add deploy_key

# Finally, return to the gh-pages directory and push the commit
cd $GH_PAGES_DIRECTORY
git push $SSH_REPO $TARGET_BRANCH
