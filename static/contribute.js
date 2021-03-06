var currentItem;
var newItems = [];
var currentAddFormProperty;

function addNewItem() {
    if (!currentItem) {
        currentItem = {};
        updateCurrentItemDisplay();
        $(".currentItem").removeClass("hidden");
        $('.currentItem .name input').val("");
        $(".currentItem .items .name").focus();
    }
}

function saveCurrentItem() {
    currentItem.userPseudo = $("#pseudo").val();
    if (currentItem.name && currentItem.type && currentItem.access && currentItem.userPseudo && currentItem.userPseudo.length > 0) {
        newItems.push(currentItem);
        displayNewItems();
        $(".currentItem").addClass("hidden");
        currentItem = null;
    } else {
        alert("Your pseudonyme as well as item's name, type and access are mandatory!");
    }
}

function displayNewItems() {
    if (newItems.length > 0) {
        var html = "";
        $(newItems).each(function (index, item){
            html += '<div class="tr">';
            html += displayItemLine(item);
            html += '<div class="td"><span class="glyphicon glyphicon-trash iconBtn" onclick="deleteNewItem(' + index + ')"/></div>';
            html += "</div>";
        });
        $("#results .tbody").html(html);
        $(".newItems").removeClass("hidden");
    } else {
        $(".newItems").addClass("hidden");
    }
}

function cancel() {
    $(".currentItem").addClass("hidden");
    currentItem = null;
}

function deleteNewItem(index) {
    newItems.splice(index, 1);
    displayNewItems();
}

function sendToServer() {
    $.ajax({
        type: "POST",
        url: "/items/temp",
        data: JSON.stringify(newItems),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        statusCode: {
            201: function(data){alert("Data successfuly saved");},
            400: function(jqXHR, textStatus, errorThrown) {alert("An error occured");}
        },
        failure: function(errMsg) {
            alert("An error occured");
        }
    });
    $(".newItems").addClass("hidden");
    newItems = [];
}

function updateCurrentItemDisplay() {
    if (currentItem.type) {
        $(".currentItem .typeChoice").prop("src", "img/" + currentItem.type + ".png");
    } else {
        $(".currentItem .typeChoice").prop("src","img/unknownType.png");
    }
    if (currentItem.name) {
        $(".currentItem .name").removeClass("empty");
        $(".currentItem .name a.name").text(currentItem.name).prop("href",toUrl(currentItem.name));
    } else {
        $(".currentItem .name").addClass("empty");
    }
    $(".currentItem .name .detail").html(getStatDetail(currentItem));
    var special = $(".currentItem .tbody .td.special");
    if (currentItem.element) {
        $(".currentItem .special .elementChoice").prop("src", "img/" + currentItem.element + ".png");
    } else {
        $(".currentItem .special .elementChoice").prop("src", "img/noElement.png");
    }
    var otherSpecials = $(".currentItem .td.special .otherSpecials");
    otherSpecials.empty();
    if (currentItem.ailments) {
        otherSpecials.append(getAilmentsHtml(currentItem));
    }
    if (currentItem.resist) {
        otherSpecials.append(getResistHtml(currentItem));
    }
    if (currentItem.killers) {
        otherSpecials.append(getKillersHtml(currentItem));
    }
    var specialList = ""; 
    if (currentItem.evade) {
        specialList += "<li>Evade " + currentItem.evade + "%</li>"
    }
    if (currentItem.special) {
        specialList += getSpecialHtml(currentItem)
        if (currentItem.special.includes("twoHanded")) {
            $(".currentItem .type .twoHanded").removeClass("hidden");
        } else {
            $(".currentItem .type .twoHanded").addClass("hidden");
        }
        if (currentItem.special.includes("notStackable")) {
            $(".currentItem .type .notStackable").removeClass("hidden");
        } else {
            $(".currentItem .type .notStackable").addClass("hidden");
        }
    } else {
        $(".currentItem .type .twoHanded").addClass("hidden");
        $(".currentItem .type .notStackable").addClass("hidden");
    }
    if (currentItem.dualWield) {
        if (currentItem.dualWield == "all") {
            specialList += "<li>" + toHtml("[Dual Wield]") + "</li>";
        } else {
            specialList += "<li>" + toHtml("[Dual Wield] of ") + "<img src='img/" + currentItem.dualWield + ".png'></img></li>";
        }
    }
    if (specialList != "") {
        otherSpecials.append("<ul>" + specialList + "</ul>");
    }
    var access = $(".currentItem .tbody .td.access");
    access.empty();
    if (currentItem.access) {
        $(currentItem.access).each(function(index, itemAccess) {
            access.append("<div>" + itemAccess + "</div>"); 
        });
    }
    if (currentItem.tmrUnit) {
        access.append('<div><a href="' + toUrl(currentItem.tmrUnit) + '">' + currentItem.tmrUnit + '</a></div>');
    }
    if (currentItem.exclusiveUnits) {
        access.append(getExclusiveUnitsHtml(currentItem));
    }
    if (currentItem.exclusiveSex) {
        access.append("<div class='exclusive'>Only " + currentItem.exclusiveSex + "</div>");
    }
    if (currentItem.equipedConditions) {
        access.append(getEquipedConditionHtml(currentItem));
    }
    
}

function selectType(type) {
    currentItem.type = type;
    updateCurrentItemDisplay();
}

function selectElement(element) {
    if (element) {
        currentItem.element = element;
    } else {
        delete currentItem.element;
    }
    updateCurrentItemDisplay();
}

function selectStat(stat) {
     displayAddForm(stat, stat);
}



function selectAilment(ailment) {
    displayAddForm("ailment-" + ailment, "%", ailment, "sword");
}

function selectResist(resist) {
    displayAddForm("resist-" + resist, "%", resist, "heavyShield");
}
function selectKiller(killer) {
    displayAddForm(killer, killer + " %", "killer");
}
function selectAccess(access) {
    if (access.startsWith("TMR")) {
        displayAddForm(access, "TMR of")
    } else {
        addAccess(access);
        updateCurrentItemDisplay();
    }
}
function addAccess(access) {
    if (!currentItem.access) {
        currentItem.access = [];
    }
    if (!currentItem.access.includes(access)) {
        currentItem.access.push(access);
    }
}

function selectExclusive(exclusive) {
    if (exclusive == 'male' || exclusive == 'female') {
        currentItem.exclusiveSex = exclusive;
        updateCurrentItemDisplay();
    } else if (exclusive == "unit") {
        displayAddForm(exclusive, "Only")
    } else {
        if (!currentItem.equipedConditions) {
            currentItem.equipedConditions = [];
        }
        if (!currentItem.equipedConditions.includes(exclusive)) {
            currentItem.equipedConditions.push(exclusive);
        }
        updateCurrentItemDisplay();
    }
}
function selectSpecial(special) {
    if (special == "twoHanded" || special == "notStackable") {
        currentItem.special = currentItem.special || [];
        if (!currentItem.special.includes(special)) {
            currentItem.special.push(special);
        }
        updateCurrentItemDisplay();
    } else if (special == "evade") {
        displayAddForm("evade", "Evade %");
    } else if (special == "dualWield") {
        currentItem.dualWield = "all";
        updateCurrentItemDisplay();
    } else {
        displayAddForm("special", "special");
    }
}


function displayAddForm(value, text, icon, miniIcon) {
    $(".currentItem .addButtons").addClass("hidden");
    if (miniIcon) {
        $(".currentItem .addForm .miniIcon").prop("src", "img/" + miniIcon + ".png").removeClass("hidden");
    } else {
        $(".currentItem .addForm .miniIcon").addClass("hidden");
    }
    if (icon) {
        $(".currentItem .addForm .icon").prop("src", "img/" + icon + ".png").removeClass("hidden");
    } else {
        $(".currentItem .addForm .icon").addClass("hidden");
    }
    $(".currentItem .addForm .name").text(text);
    var input = $(".currentItem .addForm input");
    input.val("");
    currentAddFormProperty = value;
    $(".currentItem .addForm").removeClass("hidden");
    input.focus();
}

function validateAddForm() {
    var value = $(".currentItem .addForm input").val();
    if (!value) {
        alert("Please enter a value");
        return;
    }
    if (baseStats.includes(currentAddFormProperty) || (currentAddFormProperty.endsWith('%'))) {
        if (isNaN(parseInt(value))) { alert("please enter an number"); return;}
        currentItem[currentAddFormProperty] = parseInt(value);
    } else if (currentAddFormProperty.startsWith("ailment-")) {
        if (isNaN(parseInt(value))) { alert("please enter an number"); return;}
        var ailment = currentAddFormProperty.substr(8);
        addPercentageValue("ailments",ailment, parseInt(value));
    } else if (currentAddFormProperty.startsWith("resist-")) {
        if (isNaN(parseInt(value))) { alert("please enter an number"); return;}
        var resist = currentAddFormProperty.substr(7);
        addPercentageValue("resist",resist, parseInt(value));
    } else if (killerList.includes(currentAddFormProperty)) {
        if (isNaN(parseInt(value))) { alert("please enter an number"); return;}
        addPercentageValue("killers",currentAddFormProperty, parseInt(value));
    } else if (currentAddFormProperty.startsWith("TMR")) {
        addAccess(currentAddFormProperty);
        currentItem.tmrUnit = value;
    } else if (currentAddFormProperty == "unit") {
        addExclusiveUnit(value);
    } else if (currentAddFormProperty == "condition") {
        currentItem.condition = value;
    } else if (currentAddFormProperty == "special") {
        currentItem.special = currentItem.special || [];
        currentItem.special.push(value);
    } else if (currentAddFormProperty == "evade") {
        if (isNaN(parseInt(value))) { alert("please enter an number"); return;}
        currentItem.evade = parseInt(value);
    }
    currentAddFormProperty = null;
    hideAddForm();
    updateCurrentItemDisplay();
    
}

function addExclusiveUnit(unit) {
    if (!currentItem.exclusiveUnits) {
        currentItem.exclusiveUnits = [];
    }
    var found = false;
    for (var index in currentItem.exclusiveUnits) {
        if (currentItem.exclusiveUnits[index] == unit) {
            found = true;
            break;
        }
    }
    if (!found) {
        currentItem.exclusiveUnits.push(unit);
    }
}

function addPercentageValue(propertyName, name, percent) {
    if (!currentItem[propertyName]) {
            currentItem[propertyName] = [];
        }
        var found = false;
        for (var index in currentItem[propertyName]) {
            if (currentItem[propertyName][index].name == name) {
                found = true;
                currentItem[propertyName][index].percent = percent;
            }
        }
        if (!found) {
            currentItem[propertyName].push({"name":name, "percent": percent});
        }
}

function hideAddForm() {
    $(".currentItem .addForm").addClass("hidden");
    $(".currentItem .addButtons").removeClass("hidden");
    $(".currentItem .addForm .miniIcon").prop("src", "");
    $(".currentItem .addForm .icon").prop("src", "");
}

function deleteSpecial() {
    delete currentItem.element;
    delete currentItem.special;
    delete currentItem.ailments;
    delete currentItem.resist;
    delete currentItem.killers;
    delete currentItem.evade;
    delete currentItem.dualWield;
    updateCurrentItemDisplay();
}

function deleteAccess() {
    delete currentItem.access;
    delete currentItem.tmrUnit;
    delete currentItem.exclusiveSex;
    delete currentItem.exclusiveUnits;
    delete currentItem.equipedConditions;
    updateCurrentItemDisplay();
}

$(function() {
    populateCurrentItemType();
    populateCurrentItemElement();
    populateAddStat();
    populateAddAilment();
    populateAddResist();
    populateAddKiller();
    populateAddAccess();
    populateEquipedWith();
    $('.currentItem .name input').on("input",$.debounce(300,function() {
        currentItem.name = $('.currentItem .name input').val();
        updateCurrentItemDisplay();
    }));
});

function populateCurrentItemType() {
    var target = $(".currentItem .type .dropdown-menu");
	for (var key in typeList) {
        target.append('<img src="img/' + typeList[key] + '.png" onclick="selectType(\'' + typeList[key] + '\');" class="btn btn-default"/>');
	}
}
function populateCurrentItemElement() {
    var target = $(".currentItem .special .element .dropdown-menu");
	for (var key in elementList) {
        target.append('<img src="img/' + elementList[key] + '.png" onclick="selectElement(\'' + elementList[key] + '\');" class="btn btn-default"/>');
	}
    target.append('<img src="img/noElement.png" onclick="selectElement(null);" class="btn btn-default"/>');
}
function populateAddStat() {
    var target = $(".currentItem .addStat .dropdown-menu");
	for (var key in baseStats) {
        target.append('<span class="btn btn-default stat" onclick="selectStat(\'' + baseStats[key] + '\')">' + baseStats[key] + '</span>');
        target.append('<span class="btn btn-default stat" onclick="selectStat(\'' + baseStats[key] + '%\')">' + baseStats[key] + '%</span>');
	}
}
function populateAddAilment() {
    var target = $(".currentItem .addAilment .dropdown-menu");
	for (var key in ailmentList) {
        target.append('<img src="img/' + ailmentList[key] + '.png" onclick="selectAilment(\'' + ailmentList[key] + '\');" class="btn btn-default"/>');
	}
}
function populateAddResist() {
    var target = $(".currentItem .addResist .dropdown-menu");
	for (var key in ailmentList) {
        target.append('<img src="img/' + ailmentList[key] + '.png" onclick="selectResist(\'' + ailmentList[key] + '\');" class="btn btn-default"/>');
	}
    for (var key in elementList) {
        target.append('<img src="img/' + elementList[key] + '.png" onclick="selectResist(\'' + elementList[key] + '\');" class="btn btn-default"/>');
	}
}
function populateAddKiller() {
    var target = $(".currentItem .addKiller .dropdown-menu");
	for (var key in killerList) {
        target.append('<span class="btn btn-default killer" onclick="selectKiller(\'' + killerList[key] + '\')">' + killerList[key] + '</span>');
	}
}
function populateAddAccess() {
    var target = $(".currentItem .addAccess .dropdown-menu");
	for (var key in accessList) {
        target.append('<span class="btn btn-default access" onclick="selectAccess(\'' + accessList[key] + '\')">' + accessList[key] + '</span>');
	}
}
function populateEquipedWith() {
    var target = $(".currentItem .addExclusive .dropdown-menu");
	for (var key in weaponList) {
        target.append('<img src="img/' + weaponList[key] + '.png" onclick="selectExclusive(\'' + weaponList[key] + '\');" class="btn btn-default"/>');
	}
    for (var key in headList) {
        target.append('<img src="img/' + headList[key] + '.png" onclick="selectExclusive(\'' + headList[key] + '\');" class="btn btn-default"/>');
	}
    for (var key in bodyList) {
        target.append('<img src="img/' + bodyList[key] + '.png" onclick="selectExclusive(\'' + bodyList[key] + '\');" class="btn btn-default"/>');
	}
}

function inventoryLoaded() {
   
}