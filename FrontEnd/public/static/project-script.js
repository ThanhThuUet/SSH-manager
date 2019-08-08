var main_container;
var ManagerID;

document.addEventListener("DOMContentLoaded", function () {
    main_container = document.getElementById("main-container");
    initProjectDetail(initProjectInstances);
});

function initProjectDetail(callback) {
    var projec_id = parseURLParams(window.location.href).id;
    var xhttp = new XMLHttpRequest();
    xhttp.onloadend = function () {
        if (this.status == 200) {
            result = JSON.parse(this.responseText);
            var container = document.getElementById('project-data');
            container.innerHTML="";
            var project_name = document.createElement('span');
            project_name.classList.add('pad-proj');
            project_name.innerHTML = "Project Name: <strong>" + result[0].ProjectName + "</strong>";
            container.appendChild(project_name);
            var project_company = document.createElement('span');
            project_company.innerHTML = "Company Name: <strong>" + result[0].CompanyName + "</strong>";
            project_company.classList.add('pad-proj');
            container.appendChild(project_company);
            var project_manager = document.createElement('span');
            ManagerID = result[0].ProjectManager;
            function check(){
                if(ManagerID==JSON.parse(document.cookie).UserID) return "(YOU)";
                else return "";
            }
            project_manager.innerHTML = "Project manager: <strong>" + result[0].ProjectManagerName + " " + check() + "</strong>";
            project_manager.classList.add('pad-proj');
            container.appendChild(project_manager);
            callback();
        }
        else if(this.status == 456) {
            window.location.replace("/login");
            callback();
        }
    };
    xhttp.open("GET", `http://localhost:8080/projectdetail?id=${projec_id}&token=${JSON.parse(document.cookie).token}`, true);
    xhttp.send();
}

function initProjectInstances() {
    if(JSON.parse(document.cookie).IsAdmin){
        $('#create-instance-container').html(`
        <div class="collapse" id="collapseExample">
            <div class="card card-body">
                <form autocomplete="off">
                    <h1 style="text-align: center;padding-bottom: 20px">Create Instance</h1>
                    <div class="form-group">
                        <label for="instance-create-name">Instance Name</label>
                        <input type="text" class="form-control input-group-text" id="instance-create-name" placeholder="Instance name" autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label for="instance-create-arn">Instance ARN</label>
                        <input type="text" class="form-control input-group-text" id="instance-create-arn" placeholder="Instance ARN" autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label for="instance-create-ip">Instance IP Address</label>
                        <input type="text" class="form-control input-group-text" id="instance-create-ip" placeholder="Instance IP address" autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label for="instance-create-user">Instance User (for SSH)</label>
                        <input type="text" class="form-control input-group-text" id="instance-create-user" placeholder="Instance User (for SSH)" autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label>Private key (SomeUltraPrivateKey.pem)</label>
                        <div class="input-group mb-3">
                            <div class="custom-file">
                                <input accept=".pem" type="file" class="custom-file-input" id="instance-create-sshkey">
                                <label class="custom-file-label" for="instance-create-sshkey">Choose file</label>
                            </div>
                        </div>
                    </div>
                    <div id="create-instance-alert" style="color:#ff6166"></div>
                    <button type="button" class="btn btn-success" style="margin-top: 20px" id="instance-create-confirm">Confirm</button>
                    <button type="reset" class="btn btn-outline-dark" style="margin-top: 20px"
                        onclick='{$("#create-instance").click();}'>Cancel</button>
                </form>
            </div>
        </div>
        <button style="width:100%;" id="create-instance" class="btn btn-secondary" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
            Create new instance
        </button>
        `);
        $('#instance-create-sshkey').on('change',function(e){
            $("label[for='instance-create-sshkey']").html(e.target.files[0].name)
        });
        $("#instance-create-confirm").click(function(){
            if($('#instance-create-name').val() && $('#instance-create-arn').val() && $('#instance-create-ip').val() && $('#instance-create-user').val()){
                var reader = new FileReader();
                reader.onload = function(e) {
                    var key = reader.result;
                    data = JSON.stringify({
                        InstanceName: $('#instance-create-name').val(),
                        ARN: $('#instance-create-arn').val(),
                        IpAddress: $('#instance-create-ip').val(),
                        InstanceUser: $('#instance-create-user').val(),
                        SSHKey: key,
                        ProjectID: parseURLParams(window.location.href).id
                    });
                    var xhttp = new XMLHttpRequest();
                    xhttp.onloadend = function(){
                        if (this.status == 200) {
                            noti(new Date().getTime(),"Success","New instance created.");
                            $("#create-instance").click();
                            initProjectInstances();
                        }
                        else if(this.status == 403) {
                            noti(new Date().getTime(),"Forbidden","New instance create fail.");
                        }
                        else if(this.status == 456) {
                            window.location.replace("/login");
                        }
                        else {
                            noti(new Date().getTime(),"Fail","New instance create fail.");
                        }
                    };
                    xhttp.open("POST", `http://localhost:8080/createinstance?token=${JSON.parse(document.cookie).token}`, true);
                    xhttp.setRequestHeader("Content-Type", "application/json");
                    xhttp.send(data);
                }
                reader.readAsText($('#instance-create-sshkey')[0].files[0]);
            }
            else{
                $('#create-instance-alert').html("You should fill all the field.");
            }
        });
    }
    var project_id = parseURLParams(window.location.href).id;
    var xhttp = new XMLHttpRequest();
    xhttp.onloadend = function () {
        if (this.status == 200) {
            CreateTableFromJSON(JSON.parse(this.responseText), document.getElementById('project-instances-data'));
        }
        else if(this.status == 456) {
            window.location.replace("/login");
        }
        else if ((JSON.parse(document.cookie).UserID==ManagerID||JSON.parse(document.cookie).IsAdmin) && this.status == 204) {
            document.getElementById('project-instances-data').innerHTML = "This project doesn't have any instance yet. Create a new one?";
        }
        else {
            document.getElementById('project-instances-data').innerHTML = "You don't have permission on any instances. Please contact Administrator or Project Manager";
        }
    };
    xhttp.open("GET", `http://localhost:8080/listprojectinstances?id=${project_id}&token=${JSON.parse(document.cookie).token}`, true);
    xhttp.send();
}

function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

function CreateTableFromJSON(myBooks, divContainer) {
    // EXTRACT VALUE FOR HTML HEADER.
    var col = [];
    for (var i = 0; i < myBooks.length; i++) {
        for (var key in myBooks[i]) {
            if (col.indexOf(key) === -1 && key != "ProjectID") {
                col.push(key);
            }
        }
    }

    // CREATE DYNAMIC TABLE.
    var table = document.createElement("table");

    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    var tr = table.insertRow(-1);                   // TABLE ROW.

    for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");      // TABLE HEADER.
        th.innerHTML = col[i];
        tr.appendChild(th);
    }

    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < myBooks.length; i++) {

        tr = table.insertRow(-1);
        tr.setAttribute("instance-id", myBooks[i].InstanceID);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            if (col[j] == 'InstanceName') {
                var ssh_butt = document.createElement('button');
                ssh_butt.classList.add('btn', 'btn-outline-success');
                ssh_butt.style.marginRight = "10px";
                ssh_butt.style.marginLeft = "auto";
                ssh_butt.style.cssFloat = "right";
                ssh_butt.setAttribute("instance-id", myBooks[i].InstanceID);
                ssh_butt.innerHTML = "SSH";
                ssh_butt.onclick = function () {
                    var win = window.open("http://localhost:8080/ssh?instance-id=" + this.getAttribute("instance-id"), "Title", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=800,height=600");
                }
                tabCell.innerHTML = myBooks[i][col[j]];
                tabCell.appendChild(ssh_butt);
                if (JSON.parse(document.cookie).IsAdmin) {
                    var delete_butt = document.createElement('button');
                    delete_butt.classList.add('btn', 'btn-outline-danger');
                    delete_butt.setAttribute("instance-id", myBooks[i].InstanceID);
                    delete_butt.style.marginRight = "10px";
                    delete_butt.style.marginLeft = "auto";
                    delete_butt.style.cssFloat = "right";
                    delete_butt.innerHTML = "Delele";
                    delete_butt.onclick = function () {
                        var instance_id = this.getAttribute("instance-id");
                        var xhttp = new XMLHttpRequest();
                        xhttp.onloadend = function () {
                            console.log(this.status);
                            if (this.status == 204) {
                                noti(new Date().getTime(),"Success",'Instance deleted')
                                initProjectInstances();
                            }
                            else if(this.status == 456) {
                                window.location.replace("/login");
                            }
                            else if(this.status == 403){
                                noti(new Date().getTime(),"Forbidden","Delete instance fail. You don't have permission");
                            }
                            else {
                                noti(new Date().getTime(),"Fail",'Delete instance fail');
                            }
                        };
                        xhttp.open("GET", `http://localhost:8080/deleteinstance?id=${instance_id}&token=${JSON.parse(document.cookie).token}`, true);
                        xhttp.send();
                    };
                    tabCell.appendChild(delete_butt);
                    var edit_butt = document.createElement('button');
                    edit_butt.classList.add('btn', 'btn-outline-dark');
                    edit_butt.style.marginRight = "10px";
                    edit_butt.style.marginLeft = "auto";
                    edit_butt.style.cssFloat = "right";
                    edit_butt.setAttribute("instance-id", myBooks[i].InstanceID);
                    edit_butt.innerHTML = "Edit";
                    edit_butt.onclick = function () {
                        $("#instance-edit").css("display", "block");
                        $("#instance-edit-id").val(this.getAttribute("instance-id"));
                        $("#instance-edit-confirm").attr("disabled", false);
                        $("#instance-edit-confirm").css("opacity", "1");
                        $("#instance-edit-confirm").html("Confirm");
                        $("#instance-edit-confirm").removeClass("btn-danger").addClass("btn-success");
                    };
                    $("#instance-edit-confirm").click(function () {
                        var data = JSON.stringify({ "InstanceID": $("#instance-edit-id").val(), "InstanceName": $("#instance-edit-name").val(), "ARN": $("#instance-edit-arn").val(), "IpAddress": $("#instance-edit-ip").val(), "InstanceUser": $("#instance-edit-user").val() });
                        var xhttp = new XMLHttpRequest();
                        xhttp.onloadend = function () {
                            if (this.status == 200) {
                                $("#instance-edit-confirm").attr("disabled", true);
                                $("#instance-edit-confirm").css("opacity", "0.2");
                                $("#instance-edit").css("display", "none");
                                noti(new Date().getTime(),"Success",`Instance ID ${$("#instance-edit-id").val()} change`);
                                initProjectInstances();
                            }
                            else if(this.status == 456) {
                                window.location.replace("/login");
                            }
                            else if (this.status == 403) {
                                $("#instance-edit-confirm").attr("disabled", true);
                                $("#instance-edit-confirm").css("opacity", "1");
                                $("#instance-edit-confirm").html("You don't have permisstion");
                                $("#instance-edit-confirm").removeClass("btn-success").addClass("btn-danger");
                            }
                            else if(this.status == 400){
                                $("#instance-edit-confirm").attr("disabled", true);
                                $("#instance-edit-confirm").css("opacity", "1");
                                $("#instance-edit-confirm").html("Bad Request");
                                $("#instance-edit-confirm").removeClass("btn-success").addClass("btn-danger");
                            } 
                            else
                            {
                                $("#instance-edit-confirm").attr("disabled", true);
                                $("#instance-edit-confirm").css("opacity", "1");
                                $("#instance-edit-confirm").html("Server Error");
                                $("#instance-edit-confirm").removeClass("btn-success").addClass("btn-danger");
                            }
                        };
                        xhttp.open("POST", `http://localhost:8080/updateinstance?token=${JSON.parse(document.cookie).token}`, true);
                        xhttp.setRequestHeader("Content-Type", "application/json");
                        xhttp.send(data);
                    });
                    tabCell.appendChild(edit_butt);
                }
            }
            else
                tabCell.innerHTML = myBooks[i][col[j]];
        }
    }

    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    divContainer.style.display = "block";
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
}

function noti(id, header, content) {
    $("#noti-holder").append(`<div id="${id}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <strong class="mr-auto">${header}</strong>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="toast-body">
            ${content}.
        </div>
    </div>`
    );
    $(`#${id}`).toast({delay:10000});
    $(`#${id}`).toast("show");
}