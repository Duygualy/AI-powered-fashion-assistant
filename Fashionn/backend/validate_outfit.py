import cv2
import mediapipe as mp
import sys
from PIL import Image
import torch
import os
from transformers import AutoProcessor, AutoModelForImageClassification

MODEL_ID = "Falconsai/nsfw_image_detection"
PROCESSOR = AutoProcessor.from_pretrained(MODEL_ID)
MODEL = AutoModelForImageClassification.from_pretrained(MODEL_ID)

def get_nsfw_score(image_path):
    image = Image.open(image_path).convert("RGB")
    inputs = PROCESSOR(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = MODEL(**inputs)
        logits = outputs.logits
        probs = logits.softmax(dim=1)

    labels = MODEL.config.id2label

    nsfw_labels = ["nsfw"]
    nsfw_score = sum([probs[0][i].item() for i, label in labels.items() if label.lower() in nsfw_labels])
    return nsfw_score

def get_visible_body_points(image_path):
    mp_pose = mp.solutions.pose
    image = cv2.imread(image_path)
    if image is None:
        return 0

    with mp_pose.Pose(static_image_mode=True) as pose:
        results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        if not results.pose_landmarks:
            return 0

        def is_visible(part):
            return results.pose_landmarks.landmark[part].visibility > 0.3

        upper = is_visible(mp_pose.PoseLandmark.LEFT_SHOULDER) or is_visible(mp_pose.PoseLandmark.RIGHT_SHOULDER)
        lower = is_visible(mp_pose.PoseLandmark.LEFT_KNEE) or is_visible(mp_pose.PoseLandmark.RIGHT_KNEE)

        if not (upper and lower):
            print("Only upper or lower body detected !!!")
            return 0

        required_points = [
            mp_pose.PoseLandmark.LEFT_SHOULDER,
            mp_pose.PoseLandmark.RIGHT_SHOULDER,
            mp_pose.PoseLandmark.LEFT_HIP,
            mp_pose.PoseLandmark.RIGHT_HIP,
            mp_pose.PoseLandmark.LEFT_KNEE,
            mp_pose.PoseLandmark.RIGHT_KNEE,
        ]

        count = sum(
            1 for point in required_points
            if results.pose_landmarks.landmark[point].visibility > 0.3
        )

        return count

def is_valid_outfit(image_path):
    nsfw_score = get_nsfw_score(image_path)
    visible_count = get_visible_body_points(image_path)

    print("NSFW SCORE:", nsfw_score)
    print("VISIBLE BODY POINTS:", visible_count)

    if nsfw_score > 0.95:
        return False

    return visible_count >= 4

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("false")
        sys.exit()

    original_path = sys.argv[1]
    image_path = original_path

    result = is_valid_outfit(image_path)
    print("true" if result else "false") 