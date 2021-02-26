import services.s3 as s3
import services.ec2 as ec2
import services.sqs as sqs
from dotenv import load_dotenv
import services.image_recognizer as image_recognizer

load_dotenv()

while True:
    s3_url, message = sqs.get_message()
    if not s3_url: break
    image_path = s3.fetch_image(s3_url)
    prediction = image_recognizer.predict_image(image_path)
    s3.upload_prediction(s3_url, prediction, image_path)
    message_body = '{}#{}'.format(s3_url, prediction)
    sqs.send_message(message_body)
    sqs.delete_message(message)

ec2.terminate_instance()



