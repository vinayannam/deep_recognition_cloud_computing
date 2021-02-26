import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

images = ['1_ship.png', '5_frog.png', '12_dog.png', '125_airplane.png', '161_automobile.png']
def upload(image):
    url = 'http://ec2-54-90-61-105.compute-1.amazonaws.com:3000/'
    multipart_form_data = {
        'file': (image, open(image,'rb'))
    }
    r = requests.post(url, files=multipart_form_data)
    return r.text

processes = []
with ThreadPoolExecutor(max_workers=10) as executor:
    for image in images:
        processes.append(executor.submit(upload, image))
for task in as_completed(processes):
    print(task.result())