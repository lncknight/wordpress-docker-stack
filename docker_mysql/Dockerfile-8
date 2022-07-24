# FROM mysql:5.7.26
FROM mysql:8.0.29

RUN unlink /etc/localtime \
    && ln -s /usr/share/zoneinfo/Asia/Hong_Kong /etc/localtime

RUN microdnf update -y
RUN microdnf install -y curl procps cronie rsync python3 python3-pip

# RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
#     && python get-pip.py \
#     && pip install awscli
RUN pip3 install supervisor awscli

RUN microdnf install nodejs -y
RUN npm -g i nodemon
