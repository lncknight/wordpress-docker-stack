FROM mysql:5.7.26

RUN apt update -y \
    && apt install curl python -y

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
    && python get-pip.py \
    && pip install awscli

RUN apt install supervisor -y
RUN apt install procps -y
RUN apt install cron -y

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt install nodejs -y
RUN npm -g i nodemon
