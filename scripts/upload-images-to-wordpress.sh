#!/bin/bash
#
# Upload images to WordPress Media Library with termburg_path meta
#
# Requirements:
# - WP-CLI installed on the server
# - SSH access to WordPress server
# - Images copied to server or accessible path
#
# Usage:
#   ./upload-images-to-wordpress.sh [--dry-run]
#

set -e

# Configuration
WP_PATH="/var/www/termburg.ceosivaev.ru/wordpress"
IMAGES_PATH="/var/www/termburg.ceosivaev.ru/react/public/images"
LOG_FILE="/tmp/termburg-image-upload.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for dry run mode
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}Running in DRY RUN mode - no changes will be made${NC}"
fi

# Initialize log
echo "=== Image Upload Started at $(date) ===" > "$LOG_FILE"

# Counter
UPLOADED=0
SKIPPED=0
ERRORS=0

# Function to upload single image
upload_image() {
    local file="$1"
    local relative_path="${file#$IMAGES_PATH/}"

    echo -n "Processing: $relative_path ... "

    # Check if already exists
    existing=$(wp post list --post_type=attachment --meta_key=termburg_path --meta_value="$relative_path" --format=count --path="$WP_PATH" 2>/dev/null || echo "0")

    if [[ "$existing" -gt 0 ]]; then
        echo -e "${YELLOW}SKIPPED (already exists)${NC}"
        ((SKIPPED++))
        echo "[SKIP] $relative_path - already exists" >> "$LOG_FILE"
        return
    fi

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${GREEN}WOULD UPLOAD${NC}"
        ((UPLOADED++))
        echo "[DRY] $relative_path" >> "$LOG_FILE"
        return
    fi

    # Upload to WordPress
    attachment_id=$(wp media import "$file" --porcelain --path="$WP_PATH" 2>/dev/null)

    if [[ -n "$attachment_id" && "$attachment_id" =~ ^[0-9]+$ ]]; then
        # Set termburg_path meta
        wp post meta add "$attachment_id" termburg_path "$relative_path" --path="$WP_PATH" 2>/dev/null

        echo -e "${GREEN}OK (ID: $attachment_id)${NC}"
        ((UPLOADED++))
        echo "[OK] $relative_path -> ID $attachment_id" >> "$LOG_FILE"
    else
        echo -e "${RED}ERROR${NC}"
        ((ERRORS++))
        echo "[ERROR] $relative_path - upload failed" >> "$LOG_FILE"
    fi
}

# Main upload loop
echo ""
echo "Starting image upload from: $IMAGES_PATH"
echo "WordPress path: $WP_PATH"
echo ""

# Process all image files
find "$IMAGES_PATH" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.gif" -o -iname "*.svg" \) | while read -r file; do
    upload_image "$file"
done

# Summary
echo ""
echo "==================================="
echo -e "Upload complete!"
echo -e "  ${GREEN}Uploaded: $UPLOADED${NC}"
echo -e "  ${YELLOW}Skipped: $SKIPPED${NC}"
echo -e "  ${RED}Errors: $ERRORS${NC}"
echo "==================================="
echo ""
echo "Log saved to: $LOG_FILE"
echo "=== Upload completed at $(date) ===" >> "$LOG_FILE"
