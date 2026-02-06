document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });

  ["dragleave", "dragend"].forEach(type => {
    dropZoneElement.addEventListener(type, e => {
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  dropZoneElement.addEventListener("drop", e => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      if ((file.type === 'text/plain' && file.name.endsWith('.txt')) || (file.type === 'text/csv' && file.name.endsWith('.csv')) || file.name.toLowerCase().endsWith('.dat')) {
        if ($("#agent").val() == null || $("#agent").val() == "") {
          alert("Please select Agent")
          $("#uploadButton").attr("disabled", true);
        } else {
          $("#uploadButton").attr("disabled", false);
        }


        inputElement.files = e.dataTransfer.files;
        updateThumbnail(dropZoneElement, file);
      } else {
        errorUpdateThumbnail(dropZoneElement, file)
        alert("Please select a valid file (.txt, .csv)");
        // alert($("#uploadButton").val());
        $("#pctxFile").val("");
        $("#uploadButton").attr("disabled", true);
      }
    }

    dropZoneElement.classList.remove("drop-zone--over");
  })

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
    errorUpdateThumbnail(dropZoneElement, null)
  })

  inputElement.addEventListener("change", e => {

    if (inputElement.files.length) {
      const file = inputElement.files[0];
      if ((file.type === 'text/plain' && file.name.endsWith('.txt')) || (file.type === 'text/csv' && file.name.endsWith('.csv')) || file.name.toLowerCase().endsWith('.dat')) {
        
        console.log($("#agent").val())
        if ($("#agent").val() == null || $("#agent").val() == "") {
          alert("Please select Agent")
          $("#uploadButton").attr("disabled", true);
        } else {
          $("#uploadButton").attr("disabled", false);
        }
        updateThumbnail(dropZoneElement, file);

      } else {
        errorUpdateThumbnail(dropZoneElement, file)
        $("#uploadButton").attr("disabled", true);
        $("#pctxFile").val("");
        alert("Please select a valid file (.txt, .csv)");
      }
    }

  });

});

function updateThumbnail(dropZoneEle, file) {
  let thumbnailEle = dropZoneEle.querySelector(".drop-zone__thumb");

  if (document.querySelector(".drop-zone__message")) {
    document.querySelector(".drop-zone__message").remove();
  }

  if (!thumbnailEle) {
    thumbnailEle = document.createElement("div");
    thumbnailEle.classList.add("drop-zone__thumb");
    dropZoneEle.appendChild(thumbnailEle);
  }

  thumbnailEle.dataset.label = file.name;
  if (file.type.startsWith("text/")) { // Check for text file type
    thumbnailEle.textContent = "Text File";
  } else if (file.name.toLowerCase().endsWith('.dat')){
    thumbnailEle.textContent = "DAT File";
  } else {
    thumbnailEle.textContent = "Invalid File";
  }
}
function errorUpdateThumbnail(dropZoneEle, file) {
  let thumbnailEle = dropZoneEle.querySelector(".drop-zone__message");

  if (document.querySelector(".drop-zone__thumb")) {
    document.querySelector(".drop-zone__thumb").remove();
  }

  if (!thumbnailEle) {
    const messageSpan = $('<span class="drop-zone__message">Drop file here or click to upload</span>');
    $('.drop-zone').append(messageSpan);
  }

}
$("#agent").change(function () {
  if ($(".drop-zone__thumb").attr("data-label") == null || $(".drop-zone__thumb").attr("data-label") == "") {
    alert("Please Upload PCTX")
    $("#uploadButton").attr("disabled", true);
  } else {
    $("#uploadButton").attr("disabled", false);
  }
});