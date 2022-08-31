#/bin/bash
url=http://nginx/?health_check=1
# url=https://httpstat.us/200
# url=https://httpstat.us/403
# url=https://httpstat.us/500
status_code=`curl -o /dev/null -s -f -w "%{http_code}" $url`
resCode=`echo $?`

echo "$status_code-$resCode"

if [[ $resCode != 0 ]];
then 
    if [[ $status_code = "403" ]];
    then 
        echo 'ok.'
        exit 0
    else
        echo 'not ok'    
        exit 1
    fi    
else
    echo 'ok'
    exit 0
fi    