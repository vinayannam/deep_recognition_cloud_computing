# Web Tier:
- Created a Ubuntu EC2 instance named `web-instance1` with AMI `ami-03d315ad33b9d49c4`.
- Using the key-pair `cse546` we connect through SSH to the instance using the following command
```
ssh -i "path/to/cse546.pem" ubuntu@ec2-100-26-227-146.compute-1.amazonaws.com
```
- Since we are building a node application, we setup the instance with the following requirements
```
sudo apt-get install git
curl -fsSL https://deb.nodesource.com/setup_15.x | sudo -E bash -
sudo apt-get install -y nodejs
git clone https://github.com/vinayannam/deep_recognition.git
npm install
sudo npm install pm2 -g
npm start
pm2 start ./bin/www
pm2 kill
pm2 startup
pm2 save
pm2 unstartup systemd
crontab -e
@reboot /home/ubuntu/start_app.sh
ssh -i "cse546.pem" ubuntu@ec2-54-144-134-74.compute-1.amazonaws.com
scp -i "cse546.pem" -r ../app_tier  ubuntu@ec2-3-95-31-251.compute-1.amazonaws.com:~/
scp -i "cse546.pem" -r ../startup_scripts/start_app.sh  ubuntu@ec2-3-95-31-251.compute-1.amazonaws.com:~/
chmod +x start_app.sh	
app: ami-0c55960ad8071ef1b 
web: ami-091494da721fcd673
git clone --branch dev-vinay https://github.com/vinayannam/deep_recognition.git
```